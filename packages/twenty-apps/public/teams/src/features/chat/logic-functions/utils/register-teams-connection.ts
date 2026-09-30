import { isNonEmptyString } from '@sniptt/guards';
import { getConnection, kv } from 'twenty-sdk/logic-function';

import { FEATURE_FLAGS } from 'src/constants/feature-flags';
import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { buildTeamsConnectedAccountTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-connected-account-tenant-kv-key';
import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';
import { fetchTeamsTenantId } from 'src/features/chat/logic-functions/utils/fetch-teams-tenant-id';
import { releaseTeamsConnectionTenant } from 'src/features/chat/logic-functions/utils/release-teams-connection-tenant';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

export const registerTeamsConnection = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}): Promise<{ claimedTenantId: string | null }> => {
  if (!isNonEmptyString(connectedAccountId)) {
    throw new Error(
      'Teams connection registration failed: onConnect payload is missing connectedAccountId',
    );
  }

  if (
    !isFeatureEnabled({
      isAvailable: FEATURE_FLAGS.IS_CHAT_ASSISTANT_ENABLED,
      settingValue: process.env[CHAT_ENABLED_APPLICATION_VARIABLE_KEY],
    })
  ) {
    return { claimedTenantId: null };
  }

  const connection = await getConnection(connectedAccountId);

  if (connection.visibility !== 'workspace') {
    return { claimedTenantId: null };
  }

  const tenantId = await fetchTeamsTenantId(connection.accessToken);
  const connectedAccountTenantKvKey =
    buildTeamsConnectedAccountTenantKvKey(connectedAccountId);
  const previousTenantId = await kv.get<string>(connectedAccountTenantKvKey);

  if (isNonEmptyString(previousTenantId) && previousTenantId !== tenantId) {
    await releaseTeamsConnectionTenant({ connectedAccountId });
  }

  await kv.set(connectedAccountTenantKvKey, tenantId);
  await kv.set(buildTeamsTenantKvKey(tenantId), null, { scope: 'SERVER' });

  return { claimedTenantId: tenantId };
};
