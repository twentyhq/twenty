import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { CALL_PARTICIPANTS_WIDGET_MAX_PARTICIPANTS } from 'src/front-components/constants/call-participants-widget-max-participants.constant';
import { type CallParticipantNode } from 'src/front-components/types/call-participant-node.type';
import { type CallParticipantsResult } from 'src/front-components/types/call-participants-result.type';
import { isPermissionDeniedError } from 'src/front-components/utils/is-permission-denied-error.util';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';

type CallRecordingCalendarEventNode = {
  id: string;
  calendarEventId?: string | null;
};

const fetchCallRecordingCalendarEventNode = async (
  client: CoreApiClient,
  callRecordingId: string,
): Promise<CallRecordingCalendarEventNode | undefined> => {
  const queryResult = await client.query({
    callRecordings: {
      __args: {
        filter: { id: { eq: callRecordingId } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          calendarEventId: true,
        },
      },
    },
  });

  const callRecordingNode = (
    queryResult.callRecordings as
      | ConnectionPage<CallRecordingCalendarEventNode>
      | undefined
  )?.edges?.[0]?.node;

  return isDefined(callRecordingNode) ? callRecordingNode : undefined;
};

const PARTICIPANT_SCALAR_FIELDS = {
  id: true,
  handle: true,
  displayName: true,
  isOrganizer: true,
  personId: true,
  workspaceMemberId: true,
};

const PARTICIPANT_RELATION_FIELDS = {
  person: {
    id: true,
    name: { firstName: true, lastName: true },
    avatarUrl: true,
    avatarFile: { url: true },
  },
  workspaceMember: {
    id: true,
    name: { firstName: true, lastName: true },
    avatarUrl: true,
  },
};

// The API returns one-to-many relations nested under a many-to-one as empty,
// so participants are read flat by calendarEventId instead of through
// callRecording.calendarEvent.
const fetchParticipantsForCalendarEvent = async (
  client: CoreApiClient,
  {
    calendarEventId,
    areRelationsLoaded,
  }: { calendarEventId: string; areRelationsLoaded: boolean },
): Promise<CallParticipantNode[]> => {
  let fetchedParticipantCount = 0;

  return fetchAllNodes<CallParticipantNode>(
    async (afterCursor) => {
      const queryResult = await client.query({
        calendarEventParticipants: {
          __args: {
            filter: { calendarEventId: { eq: calendarEventId } },
            first: TWENTY_PAGE_SIZE,
            ...(isUndefined(afterCursor) ? {} : { after: afterCursor }),
          },
          pageInfo: {
            hasNextPage: true,
            endCursor: true,
          },
          edges: {
            node: {
              ...PARTICIPANT_SCALAR_FIELDS,
              ...(areRelationsLoaded ? PARTICIPANT_RELATION_FIELDS : {}),
            },
          },
        },
      });

      const connection = queryResult.calendarEventParticipants as
        | ConnectionPage<CallParticipantNode>
        | undefined;

      fetchedParticipantCount += connection?.edges?.length ?? 0;

      return connection;
    },
    () => fetchedParticipantCount < CALL_PARTICIPANTS_WIDGET_MAX_PARTICIPANTS,
  );
};

export const fetchCallParticipants = async (
  client: CoreApiClient,
  { callRecordingId }: { callRecordingId: string },
): Promise<CallParticipantsResult> => {
  const callRecordingNode = await fetchCallRecordingCalendarEventNode(
    client,
    callRecordingId,
  );

  if (isUndefined(callRecordingNode)) {
    return { kind: 'callRecordingNotFound' };
  }

  const calendarEventId = callRecordingNode.calendarEventId;

  if (!isNonEmptyString(calendarEventId)) {
    return { kind: 'notLinkedToMeeting' };
  }

  try {
    return {
      kind: 'loaded',
      participants: await fetchParticipantsForCalendarEvent(client, {
        calendarEventId,
        areRelationsLoaded: true,
      }),
      areRelationsLoaded: true,
    };
  } catch (error) {
    if (!isPermissionDeniedError(error)) {
      throw error;
    }

    // A viewer who cannot read people or workspace members fails the whole
    // query; the participants' own fields still give names and ids.
    return {
      kind: 'loaded',
      participants: await fetchParticipantsForCalendarEvent(client, {
        calendarEventId,
        areRelationsLoaded: false,
      }),
      areRelationsLoaded: false,
    };
  }
};
