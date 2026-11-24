import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';

import { type CalendarChannelOwner } from 'src/logic-functions/types/calendar-channel-owner.type';
import { fetchWithRateLimitRetry } from 'src/logic-functions/utils/fetch-with-rate-limit-retry.util';

export const fetchCalendarChannelOwnerByCalendarChannelId = async (): Promise<
  Map<string, CalendarChannelOwner>
> => {
  // The endpoint refuses a caller acting for a user, which a function reached through a route is by default.
  const metadataClient = new MetadataApiClient({
    fetch: fetchWithRateLimitRetry,
    runAs: 'application',
  });
  const { calendarChannels } = await metadataClient.query({
    calendarChannels: {
      id: true,
      handle: true,
      connectedAccount: { userWorkspaceId: true },
    },
  });
  const calendarChannelOwnerByCalendarChannelId = new Map<
    string,
    CalendarChannelOwner
  >();

  for (const { id, handle, connectedAccount } of calendarChannels) {
    if (!isDefined(connectedAccount)) {
      continue;
    }

    calendarChannelOwnerByCalendarChannelId.set(id, {
      userWorkspaceId: connectedAccount.userWorkspaceId,
      handle,
    });
  }

  return calendarChannelOwnerByCalendarChannelId;
};
