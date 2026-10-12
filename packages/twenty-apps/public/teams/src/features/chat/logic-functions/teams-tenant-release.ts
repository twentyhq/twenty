import { defineLogicFunction } from 'twenty-sdk/define';

import { TEAMS_TENANT_RELEASE_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { releaseTeamsConnectionTenant } from 'src/features/chat/logic-functions/utils/release-teams-connection-tenant';
import { unregisterTeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/utils/unregister-teams-transcript-subscription';

export const teamsTenantReleaseHandler = async (payload: {
  connectedAccountId: string;
}) => {
  const [tenantRelease, transcriptUnregistration] = await Promise.allSettled([
    releaseTeamsConnectionTenant(payload),
    unregisterTeamsTranscriptSubscription(payload),
  ]);

  if (tenantRelease.status === 'rejected') {
    throw tenantRelease.reason;
  }

  if (transcriptUnregistration.status === 'rejected') {
    throw transcriptUnregistration.reason;
  }

  return { ...tenantRelease.value, ...transcriptUnregistration.value };
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_TENANT_RELEASE_UNIVERSAL_IDENTIFIER,
  name: 'teams-tenant-release',
  description:
    'Runs when a Microsoft Teams connection is removed. Releases the teams-tenant:<tenant_id> claim that connection took, unless another connection in this workspace still holds the same tenant, so another workspace can connect it. Also deletes the Microsoft Graph transcript subscription of that connection.',
  timeoutSeconds: 30,
  handler: teamsTenantReleaseHandler,
});
