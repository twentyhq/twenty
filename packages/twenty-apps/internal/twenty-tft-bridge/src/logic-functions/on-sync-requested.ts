import { DatabaseEventPayload, defineLogicFunction } from 'twenty-sdk/define';

import { ON_SYNC_REQUESTED_LF_UUID } from 'src/constants/universal-identifiers';
import { pushOpportunity } from 'src/logic-functions/shared/push-opportunity';

// Fields that round-trip between TFT and partners. A human edit to any of these on an
// already-shared (SYNCED) opportunity auto-propagates to the partners workspace.
const SHARED_FIELDS = ['name', 'amount', 'closeDate', 'company', 'pointOfContact'];

const handler = async (
  payload: DatabaseEventPayload,
): Promise<{ pushed: boolean; reason?: string }> => {
  const props = payload.properties as {
    after?: {
      id: string;
      partnerSyncRequest?: string | null;
      updatedBy?: { source?: string };
    };
    updatedFields?: string[];
  };

  const opportunityId = props.after?.id;
  if (!opportunityId) {
    return { pushed: false, reason: 'no opportunity id in payload' };
  }

  const changed = props.updatedFields ?? [];

  // Path 1 — opt-in: a human flips partnerSyncRequest to REQUESTED to share the opp.
  const requestedNow =
    changed.includes('partnerSyncRequest') && props.after?.partnerSyncRequest === 'REQUESTED';

  if (requestedNow) {
    const result = await pushOpportunity({ opportunityId });
    return { pushed: result.ok, reason: result.reason };
  }

  // Loop guard: skip updates the app itself made (the SYNCED flip, or an inbound echo
  // write). CoreApiClient writes stamp updatedBy.source = 'APPLICATION' (verified: app-
  // written opps read back as APPLICATION, human edits as MANUAL/API). Only human edits
  // should propagate outward.
  if (props.after?.updatedBy?.source === 'APPLICATION') {
    return { pushed: false, reason: 'app-originated update (loop guard)' };
  }

  // Path 2 — auto-propagate: an already-shared opp had a shared field edited by a human.
  const alreadyShared = props.after?.partnerSyncRequest === 'SYNCED';
  const sharedChanged = changed.some((f) => SHARED_FIELDS.includes(f));
  if (alreadyShared && sharedChanged) {
    const result = await pushOpportunity({ opportunityId });
    return { pushed: result.ok, reason: result.reason };
  }

  return { pushed: false, reason: 'no sync-triggering change' };
};

export default defineLogicFunction({
  universalIdentifier: ON_SYNC_REQUESTED_LF_UUID,
  name: 'on-sync-requested',
  description:
    'Fires on opportunity.updated. Pushes to the partners workspace when partnerSyncRequest flips to REQUESTED (opt-in), or when a human edits a shared field (name, amount, closeDate, company, point of contact) on an already-synced opportunity. Flips partnerSyncRequest to SYNCED or FAILED.',
  timeoutSeconds: 20,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.updated',
  },
});
