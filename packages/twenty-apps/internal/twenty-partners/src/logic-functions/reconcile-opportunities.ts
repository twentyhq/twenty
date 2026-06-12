import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { RECONCILE_OPPORTUNITIES_LF_UUID } from 'src/constants/universal-identifiers';
import { drainByCursor, getOrCreateCursor, RowOutcome } from 'src/logic-functions/shared/sync-cursor';
import { SYNC_SIGNATURE_HEADER, signPayload } from 'src/utils/hmac';

type TftOpportunity = {
  id: string;
  name: string;
  updatedAt: string;
  tftOpportunityId?: string | null;
  matchStatus?: string | null;
  numberOfSeats?: number | null;
  useCase?: string | null;
  hostingType?: string | null;
  subscriptionType?: string | null;
  subscriptionFrequency?: string | null;
  lostReason?: string | null;
  amount?: { amountMicros: number; currencyCode: string } | null;
  closeDate?: string | null;
  company?: { name: string } | null;
  pointOfContact?: {
    name?: { firstName?: string; lastName?: string };
    emails?: { primaryEmail?: string };
  } | null;
};

async function queryTft<T>(
  apiUrl: string,
  apiKey: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${apiUrl}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };
  if (data.errors?.length) throw new Error(data.errors[0].message);
  if (!data.data) throw new Error('TFT API returned no data');
  return data.data;
}

const handler = async (): Promise<{ reconciled: number; errors: number }> => {
  const tftApiUrl = process.env.TFT_API_URL;
  const tftApiKey = process.env.TFT_API_KEY;
  const secret = process.env.SYNC_SHARED_SECRET;
  const selfEndpoint = process.env.PARTNERS_SYNC_SELF_ENDPOINT;

  if (!tftApiUrl || !tftApiKey || !secret || !selfEndpoint) {
    console.error(
      '[reconcile] Missing env vars: TFT_API_URL, TFT_API_KEY, SYNC_SHARED_SECRET, or PARTNERS_SYNC_SELF_ENDPOINT',
    );
    return { reconciled: 0, errors: 0 };
  }

  const client = new CoreApiClient();
  const cursor = await getOrCreateCursor(client, 'primary');
  const since = cursor.lastCursorAt ?? new Date(0).toISOString();
  const runStartedAt = new Date().toISOString();

  await client.mutation({
    updateTftSyncCursor: {
      __args: {
        id: cursor.id,
        data: { status: 'RUNNING', lastRunAt: runStartedAt },
      },
      id: true,
    },
  } as any);

  type TftOppsResult = {
    opportunities: { edges: { node: TftOpportunity }[] };
  };

  // Pull a page of TFT opportunities modified since the watermark, ordered ascending.
  const fetchPage = async (fromCursor: string): Promise<TftOpportunity[]> => {
    const tftData = await queryTft<TftOppsResult>(
      tftApiUrl,
      tftApiKey,
      `query ReconcileOpps($since: DateTime!) {
        opportunities(filter: { updatedAt: { gte: $since } }, orderBy: { updatedAt: AscNullsFirst }, first: 100) {
          edges {
            node {
              id
              name
              updatedAt
              tftOpportunityId
              matchStatus
              numberOfSeats
              useCase
              hostingType
              subscriptionType
              subscriptionFrequency
              lostReason
              amount { amountMicros currencyCode }
              closeDate
              company { name }
              pointOfContact {
                name { firstName lastName }
                emails { primaryEmail }
              }
            }
          }
        }
      }`,
      { since: fromCursor },
    );
    return tftData.opportunities.edges.map((e) => e.node);
  };

  const pushOne = async (opp: TftOpportunity): Promise<RowOutcome> => {
    const tftOpportunityId = opp.tftOpportunityId ?? opp.id;

    // Point of contact: forward the Person's name + primary email so the receiver
    // can find-or-create and link the same contact (mirrors push-opportunity).
    const poc = opp.pointOfContact;
    const pocFirstName = poc?.name?.firstName ?? undefined;
    const pocLastName = poc?.name?.lastName ?? undefined;
    const pocEmail = poc?.emails?.primaryEmail || undefined;
    const pointOfContact =
      pocFirstName || pocLastName || pocEmail
        ? {
            ...(pocFirstName && { firstName: pocFirstName }),
            ...(pocLastName && { lastName: pocLastName }),
            ...(pocEmail && { email: pocEmail }),
          }
        : undefined;

    // Same field set as the real-time forward push so the cron backstop reconciles
    // everything, not a subset.
    const payload = {
      tftOpportunityId,
      name: opp.name,
      matchStatus: opp.matchStatus ?? undefined,
      numberOfSeats: opp.numberOfSeats ?? undefined,
      useCase: opp.useCase ?? undefined,
      hostingType: opp.hostingType ?? undefined,
      subscriptionType: opp.subscriptionType ?? undefined,
      subscriptionFrequency: opp.subscriptionFrequency ?? undefined,
      lostReason: opp.lostReason ?? undefined,
      amount: opp.amount ?? undefined,
      closeDate: opp.closeDate ?? undefined,
      companyName: opp.company?.name ?? undefined,
      pointOfContact,
    };

    const bodyString = JSON.stringify(payload);
    const signature = signPayload(bodyString, secret);

    try {
      const response = await fetch(selfEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [SYNC_SIGNATURE_HEADER]: signature,
        },
        body: bodyString,
      });
      const result = (await response.json()) as { ok: boolean };
      return result.ok ? 'ok' : 'error';
    } catch {
      return 'error';
    }
  };

  try {
    const { reconciled, errors, newCursorAt } = await drainByCursor<TftOpportunity>({
      since,
      runStartedAt,
      fetchPage,
      updatedAtOf: (opp) => opp.updatedAt,
      processRow: pushOne,
    });

    await client.mutation({
      updateTftSyncCursor: {
        __args: {
          id: cursor.id,
          data: {
            status: 'IDLE',
            lastCursorAt: newCursorAt,
            lastRunAt: runStartedAt,
          },
        },
        id: true,
      },
    } as any);

    return { reconciled, errors };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await client.mutation({
      updateTftSyncCursor: {
        __args: {
          id: cursor.id,
          data: { status: 'FAILED', lastError: errorMessage },
        },
        id: true,
      },
    } as any);
    throw err;
  }
};

export default defineLogicFunction({
  universalIdentifier: RECONCILE_OPPORTUNITIES_LF_UUID,
  name: 'reconcile-opportunities',
  description:
    'Cron backstop: every 30 min, diff TFT opportunities modified since last cursor against partners workspace, push any that are missing or stale.',
  timeoutSeconds: 120,
  handler,
  cronTriggerSettings: {
    pattern: '*/30 * * * *',
  },
});
