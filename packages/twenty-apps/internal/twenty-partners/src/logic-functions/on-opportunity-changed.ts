import { CoreApiClient } from 'twenty-client-sdk/core';
import { DatabaseEventPayload, defineLogicFunction } from 'twenty-sdk/define';

import { ON_OPPORTUNITY_CHANGED_LF_UUID } from 'src/constants/universal-identifiers';
import { buildEchoPayload } from 'src/logic-functions/shared/echo-payload';
import { SYNC_SIGNATURE_HEADER, signPayload } from 'src/utils/hmac';

// Fields that round-trip between TFT and partners (both Opportunity objects have them).
// A human edit to any of these on the partners side is echoed back to TFT.
const SHARED_FIELDS = ['name', 'amount', 'closeDate', 'company', 'pointOfContact'];

const handler = async (
  payload: DatabaseEventPayload,
): Promise<{ echoed: boolean; reason?: string }> => {
  const props = payload.properties as {
    after?: {
      id: string;
      tftOpportunityId?: string | null;
      updatedBy?: { source?: string };
    };
    updatedFields?: string[];
  };

  // Loop guard: an update whose source is the app itself was written by an inbound
  // sync (on-opportunity-synced) — CoreApiClient writes stamp updatedBy.source =
  // 'APPLICATION' (verified: synced opps read back as APPLICATION, human edits as
  // MANUAL/API). Echoing an app-originated update back to TFT would ping-pong forever.
  if (props.after?.updatedBy?.source === 'APPLICATION') {
    return { echoed: false, reason: 'app-originated update (loop guard)' };
  }

  const tftOpportunityId = props.after?.tftOpportunityId;
  if (!tftOpportunityId) {
    return { echoed: false, reason: 'no tftOpportunityId — partners-internal opportunity' };
  }

  const changed = props.updatedFields ?? [];
  const sharedChanged = changed.some((f) => SHARED_FIELDS.includes(f));
  const matchStatusChanged = changed.includes('matchStatus');
  if (!sharedChanged && !matchStatusChanged) {
    return { echoed: false, reason: 'no synced field changed' };
  }

  const secret = process.env.SYNC_SHARED_SECRET;
  const endpoint = process.env.TFT_ECHO_ENDPOINT;
  // Public base URL of this partners workspace — used to build the deep link back to TFT.
  // Never hardcode the prod URL; this is an application variable set per workspace.
  const publicUrl = process.env.PARTNERS_PUBLIC_URL;
  if (!secret || !endpoint || !publicUrl) {
    return { echoed: false, reason: 'server_misconfigured' };
  }

  const client = new CoreApiClient();
  const oppId = props.after.id;

  // The event payload only carries the record's own columns; relations (company name,
  // point of contact) must be re-read. Pull the full shared field set in one query.
  const oppResult = await client.query({
    opportunities: {
      __args: { filter: { id: { eq: oppId } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: true,
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
  const opp = (oppResult as any).opportunities?.edges?.[0]?.node;
  if (!opp) {
    return { echoed: false, reason: `opportunity ${oppId} not found` };
  }

  // Shared envelope (field set + matchStatus scope + deep link) — see shared/echo-payload.
  const echoPayload = buildEchoPayload(opp, tftOpportunityId, publicUrl);
  const bodyString = JSON.stringify(echoPayload);
  const signature = signPayload(bodyString, secret);

  const syncEventResult = await client.mutation({
    createTftSyncEvent: {
      __args: {
        data: {
          direction: 'PARTNERS_TO_TFT',
          opportunityName: opp.name as string,
          tftOpportunityId,
          payloadJson: echoPayload,
          status: 'PENDING',
          attemptCount: 1,
        },
      },
      id: true,
    },
  } as any);
  const syncEventId = (syncEventResult as any).createTftSyncEvent?.id as string;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [SYNC_SIGNATURE_HEADER]: signature,
      },
      body: bodyString,
    });

    const responseBody = (await response.json()) as { ok: boolean; reason?: string };
    if (!responseBody.ok) {
      throw new Error(
        responseBody.reason ?? `TFT returned ok=false (HTTP ${response.status})`,
      );
    }

    await client.mutation({
      updateTftSyncEvent: {
        __args: { id: syncEventId, data: { status: 'OK' } },
        id: true,
      },
    } as any);

    return { echoed: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await client.mutation({
      updateTftSyncEvent: {
        __args: { id: syncEventId, data: { status: 'FAILED', error: errorMessage } },
        id: true,
      },
    } as any);
    return { echoed: false, reason: errorMessage };
  }
};

export default defineLogicFunction({
  universalIdentifier: ON_OPPORTUNITY_CHANGED_LF_UUID,
  name: 'on-opportunity-changed',
  description:
    'Fires on opportunity.updated. For TFT-linked opportunities edited by a human (not an app sync), echoes the changed shared fields (name, amount, closeDate, company, point of contact) plus matchStatus + deep link back to TFT.',
  timeoutSeconds: 20,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.updated',
  },
});
