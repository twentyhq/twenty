import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { z } from 'zod';

import { ON_PARTNER_ECHO_RECEIVED_LF_UUID } from 'src/constants/universal-identifiers';
import { SYNC_SIGNATURE_HEADER, verifySignature } from 'src/utils/hmac';

const echoPayloadSchema = z.object({
  tftOpportunityId: z.string(),
  // Shared fields echoed back from the partners workspace (all optional — only the
  // ones the human changed need to be present).
  name: z.string().optional(),
  amount: z.object({ amountMicros: z.number(), currencyCode: z.string() }).optional(),
  closeDate: z.string().optional(),
  companyName: z.string().optional(),
  pointOfContact: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
  // Partner matching lifecycle (partners-owned, mirrored onto the read-only TFT field).
  matchStatus: z
    .enum([
      'TO_BE_MATCHED',
      'INTRODUCED_TO_A_PARTNER',
      'WORKING_WITH_A_PARTNER',
      'WON',
      'LOST',
    ])
    .optional(),
  partnersDeepLink: z.string().url(),
});

type HttpEvent = { headers?: Record<string, string | undefined>; body?: unknown };
type EchoResult = { ok: boolean; reason?: string };

// Compare two date-times by instant, not string form — the two workspaces can serialize
// the same moment differently (trailing zeros, Z vs +00:00), and a raw !== would re-write
// closeDate on every sync, perpetually bumping updatedAt and re-triggering the echo.
function sameInstant(a?: string | null, b?: string | null): boolean {
  if (a == null || b == null) return a === b;
  const ta = Date.parse(a);
  const tb = Date.parse(b);
  if (Number.isNaN(ta) || Number.isNaN(tb)) return a === b;
  return ta === tb;
}

const handler = async (event: HttpEvent): Promise<EchoResult> => {
  const headers = event.headers ?? {};
  const rawBody = event.body;

  const secret = process.env.SYNC_SHARED_SECRET;
  if (!secret) return { ok: false, reason: 'server_misconfigured' };

  const signature = headers[SYNC_SIGNATURE_HEADER] ?? '';
  if (!verifySignature(JSON.stringify(rawBody), secret, signature)) {
    return { ok: false, reason: 'unauthorized' };
  }

  const parsed = echoPayloadSchema.safeParse(rawBody);
  if (!parsed.success) return { ok: false, reason: 'invalid_payload' };

  const { tftOpportunityId, name, amount, closeDate, companyName, pointOfContact, matchStatus, partnersDeepLink } =
    parsed.data;
  const client = new CoreApiClient();

  // On the TFT workspace, tftOpportunityId is the opportunity's own ID
  // (no separate tftOpportunityId field exists here — that field lives on the partners side).
  // Read current values so we only write fields that actually differ (compare-before-write):
  // this is the backstop that breaks any sync loop even if the source guard misses, and it
  // lets the reconcile cron re-echo already-synced opps as silent no-ops (no audit event).
  const oppLookup = await client.query({
    opportunities: {
      __args: { filter: { id: { eq: tftOpportunityId } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: true,
          partnerMatchStatus: true,
          partnersDeepLink: { primaryLinkUrl: true },
          amount: { amountMicros: true, currencyCode: true },
          closeDate: true,
          company: { id: true, name: true },
          pointOfContact: { id: true, emails: { primaryEmail: true } },
        },
      },
    },
  } as any);
  const opp = (oppLookup as any).opportunities?.edges?.[0]?.node as
    | {
        id: string;
        name: string;
        partnerMatchStatus?: string | null;
        partnersDeepLink?: { primaryLinkUrl?: string | null } | null;
        amount?: { amountMicros: number; currencyCode: string } | null;
        closeDate?: string | null;
        company?: { id: string; name: string } | null;
        pointOfContact?: { id: string; emails?: { primaryEmail?: string } } | null;
      }
    | undefined;

  // Opportunity missing → log a FAILED event so the gap is visible in the audit log.
  if (!opp) {
    await client.mutation({
      createTftSyncEvent: {
        __args: {
          data: {
            direction: 'PARTNERS_TO_TFT',
            opportunityName: name,
            tftOpportunityId,
            payloadJson: rawBody,
            status: 'FAILED',
            error: `Opportunity with id ${tftOpportunityId} not found in TFT workspace`,
            attemptCount: 1,
          },
        },
        id: true,
      },
    } as any);
    return { ok: false, reason: 'opportunity not found' };
  }

  // Build the change set up front (changed fields only) so a no-op echo — e.g. the
  // reconcile cron re-echoing an already-synced opp — writes nothing and logs nothing.
  const data: Record<string, unknown> = {};

  if (matchStatus && matchStatus !== opp.partnerMatchStatus) {
    data.partnerMatchStatus = matchStatus;
  }
  if (partnersDeepLink !== opp.partnersDeepLink?.primaryLinkUrl) {
    data.partnersDeepLink = {
      primaryLinkUrl: partnersDeepLink,
      primaryLinkLabel: 'Open in partners',
    };
  }
  if (name != null && name !== opp.name) {
    data.name = name;
  }
  if (
    amount != null &&
    (amount.amountMicros !== opp.amount?.amountMicros ||
      amount.currencyCode !== opp.amount?.currencyCode)
  ) {
    data.amount = amount;
  }
  if (closeDate != null && !sameInstant(closeDate, opp.closeDate)) {
    data.closeDate = closeDate;
  }

  try {
    // Company — resolve by name (find-or-create), link only if it changed.
    if (companyName != null && companyName !== opp.company?.name) {
      const companyLookup = await client.query({
        companies: {
          __args: { filter: { name: { eq: companyName } }, first: 1 },
          edges: { node: { id: true } },
        },
      } as any);
      let companyId = (companyLookup as any).companies?.edges?.[0]?.node?.id as string | undefined;
      if (!companyId) {
        const created = await client.mutation({
          createCompany: { __args: { data: { name: companyName } }, id: true },
        } as any);
        companyId = (created as any).createCompany?.id as string | undefined;
      }
      if (companyId && companyId !== opp.company?.id) {
        data.companyId = companyId;
      }
    }

    // Point of contact — resolve by primary email (find-or-create), link only if it changed.
    // Skip resolution entirely when the incoming contact already matches the linked one by
    // email: avoids a people lookup (and a possible createPerson on an email near-miss) on
    // every no-op echo from the reconcile cron.
    const incomingPocEmail = pointOfContact?.email;
    const pocAlreadyLinked =
      incomingPocEmail != null && incomingPocEmail === opp.pointOfContact?.emails?.primaryEmail;
    if (
      pointOfContact &&
      !pocAlreadyLinked &&
      (pointOfContact.firstName || pointOfContact.lastName || pointOfContact.email)
    ) {
      const { firstName, lastName, email } = pointOfContact;
      let pointOfContactId: string | undefined;
      if (email) {
        const personLookup = await client.query({
          people: {
            __args: { filter: { emails: { primaryEmail: { eq: email } } }, first: 1 },
            edges: { node: { id: true } },
          },
        } as any);
        pointOfContactId = (personLookup as any).people?.edges?.[0]?.node?.id as string | undefined;
      }
      if (!pointOfContactId) {
        const created = await client.mutation({
          createPerson: {
            __args: {
              data: {
                name: { firstName: firstName ?? '', lastName: lastName ?? '' },
                ...(email && { emails: { primaryEmail: email } }),
              },
            },
            id: true,
          },
        } as any);
        pointOfContactId = (created as any).createPerson?.id as string | undefined;
      }
      if (pointOfContactId && pointOfContactId !== opp.pointOfContact?.id) {
        data.pointOfContactId = pointOfContactId;
      }
    }

    // Nothing actually changed → silent no-op (no write, no audit event).
    if (Object.keys(data).length === 0) {
      return { ok: true };
    }

    const syncEventResult = await client.mutation({
      createTftSyncEvent: {
        __args: {
          data: {
            direction: 'PARTNERS_TO_TFT',
            opportunityName: opp.name,
            tftOpportunityId,
            payloadJson: rawBody,
            status: 'PENDING',
            attemptCount: 1,
          },
        },
        id: true,
      },
    } as any);
    const syncEventId = (syncEventResult as any).createTftSyncEvent?.id as string;

    try {
      await client.mutation({
        updateOpportunity: {
          __args: { id: opp.id, data },
          id: true,
        },
      } as any);

      await client.mutation({
        updateTftSyncEvent: {
          __args: { id: syncEventId, data: { status: 'OK' } },
          id: true,
        },
      } as any);

      return { ok: true };
    } catch (writeErr) {
      const errorMessage = writeErr instanceof Error ? writeErr.message : String(writeErr);
      await client.mutation({
        updateTftSyncEvent: {
          __args: { id: syncEventId, data: { status: 'FAILED', error: errorMessage } },
          id: true,
        },
      } as any);
      return { ok: false, reason: errorMessage };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    // Resolution failed before we logged a PENDING event — log the failure now.
    await client.mutation({
      createTftSyncEvent: {
        __args: {
          data: {
            direction: 'PARTNERS_TO_TFT',
            opportunityName: opp.name,
            tftOpportunityId,
            payloadJson: rawBody,
            status: 'FAILED',
            error: errorMessage,
            attemptCount: 1,
          },
        },
        id: true,
      },
    } as any);
    return { ok: false, reason: errorMessage };
  }
};

export default defineLogicFunction({
  universalIdentifier: ON_PARTNER_ECHO_RECEIVED_LF_UUID,
  name: 'on-partner-echo-received',
  description:
    'httpRoute: receives the reverse echo from the partners workspace. Verifies HMAC, then writes the changed shared fields (name, amount, closeDate, company, point of contact) plus partnerMatchStatus + partnersDeepLink onto the TFT Opportunity. Compares before writing; a no-op echo writes nothing and logs no audit event.',
  timeoutSeconds: 20,
  handler,
  httpRouteTriggerSettings: {
    path: '/partner-echo',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: [SYNC_SIGNATURE_HEADER],
  },
});
