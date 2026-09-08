import { isNonEmptyString } from '@sniptt/guards';
import { isSupportedMeetingPlatformUrl } from 'src/logic-functions/domain/is-supported-meeting-platform-url.util';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { fetchCalendarEventsByFilter } from 'src/logic-functions/data/fetch-calendar-events-by-filter.util';
import { asRecord } from '@twentyhq/recall-utils/utils/as-record.util';

export const getDesktopCompanionAgenda = async (
  client: CoreApiClient,
  userWorkspaceId: string,
) => {
  const metadata = await new RestApiClient({ runAs: 'user' }).post<{
    data?: {
      myCalendarChannels: { id: string }[];
      currentWorkspace: { id: string; displayName: string };
    };
    errors?: { message: string }[];
  }>('/metadata', {
    query:
      'query CompanionCalendar { myCalendarChannels { id } currentWorkspace { id displayName } }',
  });
  if (!metadata?.data || metadata.errors?.length)
    throw new Error(
      'Unable to read your connected calendars. Reconnect your Twenty workspace.',
    );
  const channelIds = metadata.data.myCalendarChannels.map(
    (channel) => channel.id,
  );
  const now = Date.now();
  const events = channelIds.length
    ? await fetchCalendarEventsByFilter(client, {
        and: [
          {
            endsAt: { gte: new Date(now - 7 * 24 * 60 * 60_000).toISOString() },
          },
          { startsAt: { lte: new Date(now + 48 * 60 * 60_000).toISOString() } },
          { isCanceled: { eq: false } },
          { isFullDay: { eq: false } },
        ],
      })
    : [];
  const eventIds = events.map((event) => event.id);
  const associations = eventIds.length
    ? await fetchAllNodes<{ calendarEventId: string }>(async (after) => {
        const result = await client.query({
          calendarChannelEventAssociations: {
            __args: {
              first: 200,
              ...(after ? { after } : {}),
              filter: {
                and: [
                  { calendarChannelId: { in: channelIds } },
                  { calendarEventId: { in: eventIds } },
                ],
              },
            },
            edges: { node: { calendarEventId: true } },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        });
        return result.calendarChannelEventAssociations as
          | ConnectionPage<{ calendarEventId: string }>
          | undefined;
      })
    : [];
  const ownEventIds = new Set(
    associations.map((association) => association.calendarEventId),
  );
  const meetings = events
    .flatMap((event) => {
      if (
        !ownEventIds.has(event.id) ||
        !isNonEmptyString(event.startsAt) ||
        !isNonEmptyString(event.endsAt) ||
        Date.parse(event.endsAt) <= now
      )
        return [];
      const recordingEnabled = event.callRecorderPreference !== 'OFF';
      return [
        {
          id: event.id,
          title: event.title ?? 'Untitled meeting',
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          url: event.conferenceLinkUrl ?? null,
          recordingEnabled,
          usesCalendarBot:
            recordingEnabled &&
            isNonEmptyString(event.conferenceLinkUrl) &&
            isSupportedMeetingPlatformUrl(event.conferenceLinkUrl),
        },
      ];
    })
    .sort((first, second) => first.startsAt.localeCompare(second.startsAt));
  const result = await client.query({
    callRecordings: {
      __args: {
        first: 100,
        orderBy: [{ createdAt: 'DescNullsLast' }],
        filter: {
          and: [
            {
              createdAt: {
                gte: new Date(now - 7 * 24 * 60 * 60_000).toISOString(),
              },
            },
            {
              or: [
                { desktopRecordingSession: { like: `%${userWorkspaceId}%` } },
                ...(ownEventIds.size
                  ? [{ calendarEventId: { in: [...ownEventIds] } }]
                  : []),
              ],
            },
          ],
        },
      },
      edges: {
        node: {
          id: true,
          title: true,
          status: true,
          startedAt: true,
          endedAt: true,
          calendarEventId: true,
          desktopRecordingSession: true,
        },
      },
    },
  });
  type RecentRecording = {
    id: string;
    title: string;
    status: string;
    startedAt?: string;
    endedAt?: string;
    calendarEventId?: string;
    desktopRecordingSession?: unknown;
  };
  const recordings = (
    (result.callRecordings?.edges ?? []) as { node: RecentRecording }[]
  )
    .map(({ node }) => node)
    .filter(
      (recording) =>
        asRecord(recording.desktopRecordingSession)?.userWorkspaceId ===
          userWorkspaceId ||
        (recording.calendarEventId &&
          ownEventIds.has(recording.calendarEventId)),
    )
    .map(({ desktopRecordingSession: _session, ...recording }) => recording);
  return {
    workspace: {
      id: getCurrentWorkspaceId() ?? metadata.data.currentWorkspace.id,
      name: metadata.data.currentWorkspace.displayName ?? 'Twenty',
    },
    meetings,
    recordings,
    calendarConnected: channelIds.length > 0,
  };
};
