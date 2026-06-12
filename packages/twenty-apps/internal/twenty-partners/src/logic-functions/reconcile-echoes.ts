import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { RECONCILE_ECHOES_LF_UUID } from 'src/constants/universal-identifiers';
import { buildEchoPayload, EchoOpportunity } from 'src/logic-functions/shared/echo-payload';
import { drainByCursor, getOrCreateCursor, RowOutcome } from 'src/logic-functions/shared/sync-cursor';
import { SYNC_SIGNATURE_HEADER, signPayload } from 'src/utils/hmac';

type PartnerOpportunity = EchoOpportunity & {
  updatedAt: string;
  tftOpportunityId?: string | null;
};

const handler = async (): Promise<{ reconciled: number; errors: number }> => {
  const secret = process.env.SYNC_SHARED_SECRET;
  const echoEndpoint = process.env.TFT_ECHO_ENDPOINT;
  const publicUrl = process.env.PARTNERS_PUBLIC_URL;

  if (!secret || !echoEndpoint || !publicUrl) {
    console.error(
      '[reconcile-echoes] Missing env vars: SYNC_SHARED_SECRET, TFT_ECHO_ENDPOINT, or PARTNERS_PUBLIC_URL',
    );
    return { reconciled: 0, errors: 0 };
  }

  const client = new CoreApiClient();
  const cursor = await getOrCreateCursor(client, 'reverse');
  const since = cursor.lastCursorAt ?? new Date(0).toISOString();
  const runStartedAt = new Date().toISOString();

  await client.mutation({
    updateTftSyncCursor: {
      __args: { id: cursor.id, data: { status: 'RUNNING', lastRunAt: runStartedAt } },
      id: true,
    },
  } as any);

  // tftOpportunityId can't be filtered NOT_NULL through the client cleanly, so we fetch the
  // page ordered by updatedAt and skip partners-internal opps (no tftOpportunityId) in code.
  const fetchPage = async (fromCursor: string): Promise<PartnerOpportunity[]> => {
    const result = await client.query({
      opportunities: {
        __args: {
          filter: { updatedAt: { gte: fromCursor } },
          orderBy: [{ updatedAt: 'AscNullsFirst' }],
          first: 100,
        },
        edges: {
          node: {
            id: true,
            name: true,
            updatedAt: true,
            tftOpportunityId: true,
            matchStatus: true,
            amount: { amountMicros: true, currencyCode: true },
            closeDate: true,
            company: { name: true },
            pointOfContact: {
              name: { firstName: true, lastName: true },
              emails: { primaryEmail: true },
            },
          },
        },
      },
    } as any);
    return ((result as any).opportunities?.edges ?? []).map(
      (e: any) => e.node as PartnerOpportunity,
    );
  };

  const echoOne = async (opp: PartnerOpportunity): Promise<RowOutcome> => {
    if (!opp.tftOpportunityId) return 'skip'; // partners-internal, nothing to echo

    const payload = buildEchoPayload(opp, opp.tftOpportunityId, publicUrl);
    const bodyString = JSON.stringify(payload);
    const signature = signPayload(bodyString, secret);

    try {
      const response = await fetch(echoEndpoint, {
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
    const { reconciled, errors, newCursorAt } = await drainByCursor<PartnerOpportunity>({
      since,
      runStartedAt,
      fetchPage,
      updatedAtOf: (opp) => opp.updatedAt,
      processRow: echoOne,
    });

    await client.mutation({
      updateTftSyncCursor: {
        __args: {
          id: cursor.id,
          data: { status: 'IDLE', lastCursorAt: newCursorAt, lastRunAt: runStartedAt },
        },
        id: true,
      },
    } as any);

    return { reconciled, errors };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await client.mutation({
      updateTftSyncCursor: {
        __args: { id: cursor.id, data: { status: 'FAILED', lastError: errorMessage } },
        id: true,
      },
    } as any);
    throw err;
  }
};

export default defineLogicFunction({
  universalIdentifier: RECONCILE_ECHOES_LF_UUID,
  name: 'reconcile-echoes',
  description:
    'Cron backstop (reverse): every 30 min, re-echo partner-side opportunities modified since the reverse cursor back to TFT, catching any real-time echo that failed or never fired. The TFT receiver compares before writing, so already-synced opps are silent no-ops.',
  timeoutSeconds: 120,
  handler,
  cronTriggerSettings: {
    pattern: '15,45 * * * *',
  },
});
