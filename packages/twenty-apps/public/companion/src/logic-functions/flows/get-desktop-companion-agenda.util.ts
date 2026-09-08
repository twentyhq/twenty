import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { fetchCalendarEventsByFilter } from 'src/logic-functions/data/fetch-calendar-events-by-filter.util';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { getRecordingParticipants } from 'src/logic-functions/flows/get-recording-participants.util';

export const getDesktopCompanionAgenda = async (
  client: CoreApiClient,
  userWorkspaceId: string,
) => {
  const metadata = await new RestApiClient({ runAs: 'user' }).post<{
    data?: {
      myCalendarChannels: { id: string; handle?: string }[];
      currentWorkspace: { id: string; displayName: string };
      currentUser?: {
        firstName?: string;
        lastName?: string;
        email?: string;
        workspaceMember?: { id: string } | null;
      } | null;
    };
    errors?: { message: string }[];
  }>('/metadata', {
    query:
      'query CompanionCalendar { myCalendarChannels { id handle } currentWorkspace { id displayName } currentUser { firstName lastName email workspaceMember { id } } }',
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
  // Standard recording state lets a separately installed bot coexist without
  // depending on any other application's custom fields or platform rules.
  const botRecordings = ownEventIds.size
    ? await client.query({
        callRecordings: {
          __args: {
            first: 200,
            filter: {
              and: [
                { calendarEventId: { in: [...ownEventIds] } },
                { status: { in: ['SCHEDULED', 'JOINING', 'RECORDING'] } },
                {
                  or: [
                    { externalBotId: { is: 'NOT_NULL' } },
                    { status: { eq: 'SCHEDULED' } },
                  ],
                },
              ],
            },
          },
          edges: { node: { calendarEventId: true } },
        },
      })
    : undefined;
  const botEventIds = new Set(
    botRecordings?.callRecordings?.edges.map(
      ({ node }) => node.calendarEventId,
    ) ?? [],
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
      return [
        {
          id: event.id,
          title: event.title ?? 'Untitled meeting',
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          url: event.conferenceLinkUrl ?? null,
          recordingEnabled: true,
          usesCalendarBot: botEventIds.has(event.id),
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
              companionSession: { like: `%${userWorkspaceId}%` },
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
          companionSession: true,
          transcript: true,
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
    companionSession?: unknown;
    transcript?: unknown;
  };
  const recordings = (
    (result.callRecordings?.edges ?? []) as { node: RecentRecording }[]
  )
    .map(({ node }) => node)
    .filter(
      (recording) =>
        asRecord(recording.companionSession)?.userWorkspaceId ===
        userWorkspaceId,
    );
  const viewer = metadata.data.currentUser;
  const participants = await getRecordingParticipants(client, recordings, {
    emails: [
      viewer?.email,
      ...metadata.data.myCalendarChannels.map((channel) => channel.handle),
    ].filter(
      (email): email is string =>
        typeof email === 'string' && email.trim() !== '',
    ),
    name: [viewer?.firstName, viewer?.lastName].filter(Boolean).join(' '),
    workspaceMemberId: viewer?.workspaceMember?.id,
  });
  return {
    workspace: {
      id: getCurrentWorkspaceId() ?? metadata.data.currentWorkspace.id,
      name: metadata.data.currentWorkspace.displayName ?? 'Twenty',
    },
    meetings,
    recordings: recordings.map(
      ({
        companionSession: _session,
        transcript: _transcript,
        ...recording
      }) => ({
        ...recording,
        participants: participants.get(recording.id) ?? [],
      }),
    ),
    calendarConnected: channelIds.length > 0,
  };
};
