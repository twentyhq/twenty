import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';

import { fetchWithRateLimitRetry } from 'src/logic-functions/utils/fetch-with-rate-limit-retry.util';

export const fetchOwnerUserWorkspaceIdByCalendarChannelId = async (): Promise<
  Map<string, string>
> => {
  // The endpoint refuses a caller acting for a user, which a function reached through a route is by default.
  const metadataClient = new MetadataApiClient({
    fetch: fetchWithRateLimitRetry,
    runAs: 'application',
  });
  const { calendarChannels } = await metadataClient.query({
    calendarChannels: {
      id: true,
      connectedAccount: { userWorkspaceId: true },
    },
  });
  const ownerUserWorkspaceIdByCalendarChannelId = new Map<string, string>();

  for (const { id, connectedAccount } of calendarChannels) {
    if (!isDefined(connectedAccount)) {
      continue;
    }

    ownerUserWorkspaceIdByCalendarChannelId.set(
      id,
      connectedAccount.userWorkspaceId,
    );
  }

  return ownerUserWorkspaceIdByCalendarChannelId;
};
