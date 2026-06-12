import { isString, isUndefined } from '@sniptt/guards';

export type CalendarChannelOwner = {
  calendarChannelId: string;
  workspaceMemberId: string | undefined;
};

type CalendarChannelOwnersQueryResult = {
  data?: {
    calendarChannelOwners?: {
      calendarChannelId: string;
      workspaceMemberId: string | null;
    }[];
  };
  errors?: { message?: string }[];
};

// The calendarChannelOwners query is newer than the pinned twenty-client-sdk
// metadata schema, so it is called over raw GraphQL with local types.
const CALENDAR_CHANNEL_OWNERS_QUERY = `
  query CalendarChannelOwners($calendarChannelIds: [UUID!]) {
    calendarChannelOwners(calendarChannelIds: $calendarChannelIds) {
      calendarChannelId
      workspaceMemberId
    }
  }
`;

export const fetchCalendarChannelOwners = async (
  calendarChannelIds?: string[],
): Promise<CalendarChannelOwner[]> => {
  if (calendarChannelIds?.length === 0) {
    return [];
  }

  const appAccessToken =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;
  const response = await fetch(`${process.env.TWENTY_API_URL}/metadata`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${appAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: CALENDAR_CHANNEL_OWNERS_QUERY,
      variables: isUndefined(calendarChannelIds) ? {} : { calendarChannelIds },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `calendarChannelOwners request failed with HTTP ${response.status}`,
    );
  }

  const queryResult =
    (await response.json()) as CalendarChannelOwnersQueryResult;

  if (!isUndefined(queryResult.errors) && queryResult.errors.length > 0) {
    throw new Error(
      `calendarChannelOwners request failed: ${JSON.stringify(queryResult.errors)}`,
    );
  }

  const calendarChannelOwners = queryResult.data?.calendarChannelOwners;

  if (isUndefined(calendarChannelOwners)) {
    throw new Error('calendarChannelOwners request returned no data');
  }

  return calendarChannelOwners.map((calendarChannelOwner) => ({
    calendarChannelId: calendarChannelOwner.calendarChannelId,
    workspaceMemberId: isString(calendarChannelOwner.workspaceMemberId)
      ? calendarChannelOwner.workspaceMemberId
      : undefined,
  }));
};
