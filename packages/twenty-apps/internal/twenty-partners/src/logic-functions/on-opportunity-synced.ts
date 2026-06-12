import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { z } from 'zod';

import { ON_OPPORTUNITY_SYNCED_LF_UUID } from 'src/constants/universal-identifiers';
import { SYNC_SIGNATURE_HEADER, verifySignature } from 'src/utils/hmac';

const forwardPayloadSchema = z.object({
  tftOpportunityId: z.string(),
  name: z.string(),
  matchStatus: z.string().optional(),
  numberOfSeats: z.number().optional(),
  useCase: z.string().optional(),
  hostingType: z.string().optional(),
  subscriptionType: z.string().optional(),
  subscriptionFrequency: z.string().optional(),
  lostReason: z.string().optional(),
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
});

type ForwardPayload = z.infer<typeof forwardPayloadSchema>;
type HttpEvent = { headers?: Record<string, string | undefined>; body?: unknown };
type SyncResult = { ok: boolean; reason?: string };

// Compare two date-times by instant, not string form — the two workspaces can serialize
// the same moment differently, and a raw !== would re-write closeDate on every sync.
function sameInstant(a?: string | null, b?: string | null): boolean {
  if (a == null || b == null) return a === b;
  const ta = Date.parse(a);
  const tb = Date.parse(b);
  if (Number.isNaN(ta) || Number.isNaN(tb)) return a === b;
  return ta === tb;
}

const handler = async (event: HttpEvent): Promise<SyncResult> => {
  const headers = event.headers ?? {};
  const rawBody = event.body;

  const secret = process.env.SYNC_SHARED_SECRET;
  if (!secret) return { ok: false, reason: 'server_misconfigured' };

  const signature = headers[SYNC_SIGNATURE_HEADER] ?? '';
  const bodyString = JSON.stringify(rawBody);

  if (!verifySignature(bodyString, secret, signature)) {
    return { ok: false, reason: 'unauthorized' };
  }

  const parsed = forwardPayloadSchema.safeParse(rawBody);
  if (!parsed.success) {
    return { ok: false, reason: 'invalid_payload' };
  }

  const payload: ForwardPayload = parsed.data;
  const client = new CoreApiClient();

  // Log PENDING sync event
  const syncEventResult = await client.mutation({
    createTftSyncEvent: {
      __args: {
        data: {
          direction: 'TFT_TO_PARTNERS',
          opportunityName: payload.name,
          tftOpportunityId: payload.tftOpportunityId,
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
    // Resolve company
    let companyId: string | undefined;
    if (payload.companyName) {
      const companyLookup = await client.query({
        companies: {
          __args: { filter: { name: { eq: payload.companyName } }, first: 1 },
          edges: { node: { id: true } },
        },
      } as any);
      companyId = (companyLookup as any).companies?.edges?.[0]?.node?.id as string | undefined;

      if (!companyId) {
        const created = await client.mutation({
          createCompany: { __args: { data: { name: payload.companyName } }, id: true },
        } as any);
        companyId = (created as any).createCompany?.id as string;
      }
    }

    // Resolve point of contact (Person): find by primary email, else create with name + email + company.
    let pointOfContactId: string | undefined;
    if (payload.pointOfContact) {
      const { firstName, lastName, email } = payload.pointOfContact;
      if (email) {
        const personLookup = await client.query({
          people: {
            __args: { filter: { emails: { primaryEmail: { eq: email } } }, first: 1 },
            edges: { node: { id: true } },
          },
        } as any);
        pointOfContactId = (personLookup as any).people?.edges?.[0]?.node?.id as string | undefined;
      }

      if (!pointOfContactId && (firstName || lastName || email)) {
        const created = await client.mutation({
          createPerson: {
            __args: {
              data: {
                name: { firstName: firstName ?? '', lastName: lastName ?? '' },
                ...(email && { emails: { primaryEmail: email } }),
                ...(companyId && { companyId }),
              },
            },
            id: true,
          },
        } as any);
        pointOfContactId = (created as any).createPerson?.id as string | undefined;
      }
    }

    // Upsert opportunity. Read current values too so the update only writes fields that
    // actually differ (compare-before-write) — the backstop that stops a sync loop even
    // if the source guard on the outbound trigger ever misses.
    const existing = await client.query({
      opportunities: {
        __args: { filter: { tftOpportunityId: { eq: payload.tftOpportunityId } }, first: 1 },
        edges: {
          node: {
            id: true,
            name: true,
            amount: { amountMicros: true, currencyCode: true },
            closeDate: true,
            company: { id: true },
            pointOfContact: { id: true },
          },
        },
      },
    } as any);
    const current = (existing as any).opportunities?.edges?.[0]?.node as
      | {
          id: string;
          name?: string;
          amount?: { amountMicros: number; currencyCode: string } | null;
          closeDate?: string | null;
          company?: { id: string } | null;
          pointOfContact?: { id: string } | null;
        }
      | undefined;
    const existingId = current?.id;

    const oppData: Record<string, unknown> = {
      tftOpportunityId: payload.tftOpportunityId,
    };
    if (payload.name != null && payload.name !== current?.name) oppData.name = payload.name;
    if (payload.matchStatus) oppData.matchStatus = payload.matchStatus;
    if (payload.numberOfSeats !== undefined) oppData.numberOfSeats = payload.numberOfSeats;
    if (payload.useCase) oppData.useCase = payload.useCase;
    if (payload.hostingType) oppData.hostingType = payload.hostingType;
    if (payload.subscriptionType) oppData.subscriptionType = payload.subscriptionType;
    if (payload.subscriptionFrequency) oppData.subscriptionFrequency = payload.subscriptionFrequency;
    if (payload.lostReason) oppData.lostReason = payload.lostReason;
    if (
      payload.amount &&
      (payload.amount.amountMicros !== current?.amount?.amountMicros ||
        payload.amount.currencyCode !== current?.amount?.currencyCode)
    ) {
      oppData.amount = payload.amount;
    }
    if (payload.closeDate && !sameInstant(payload.closeDate, current?.closeDate)) oppData.closeDate = payload.closeDate;
    if (companyId && companyId !== current?.company?.id) oppData.companyId = companyId;
    if (pointOfContactId && pointOfContactId !== current?.pointOfContact?.id) {
      oppData.pointOfContactId = pointOfContactId;
    }

    if (existingId) {
      // Only the tftOpportunityId remains → nothing changed, skip the write (no-op).
      if (Object.keys(oppData).length > 1) {
        await client.mutation({
          updateOpportunity: { __args: { id: existingId, data: oppData }, id: true },
        } as any);
      }
    } else {
      oppData.name = payload.name;
      await client.mutation({
        createOpportunity: {
          __args: {
            data: { ...oppData, matchStatus: payload.matchStatus ?? 'TO_BE_MATCHED' },
          },
          id: true,
        },
      } as any);
    }

    await client.mutation({
      updateTftSyncEvent: {
        __args: { id: syncEventId, data: { status: 'OK' } },
        id: true,
      },
    } as any);

    return { ok: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await client.mutation({
      updateTftSyncEvent: {
        __args: { id: syncEventId, data: { status: 'FAILED', error: errorMessage } },
        id: true,
      },
    } as any);
    return { ok: false, reason: errorMessage };
  }
};

export default defineLogicFunction({
  universalIdentifier: ON_OPPORTUNITY_SYNCED_LF_UUID,
  name: 'on-opportunity-synced',
  description:
    'Receive a forward push from twenty-tft-bridge. Verifies HMAC-SHA256, upserts Opportunity by tftOpportunityId, logs TftSyncEvent.',
  timeoutSeconds: 20,
  handler,
  httpRouteTriggerSettings: {
    path: '/tft-sync',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: [SYNC_SIGNATURE_HEADER],
  },
});
