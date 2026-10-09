import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { CALL_PARTICIPANTS_WIDGET_MAX_PARTICIPANTS } from 'src/front-components/constants/call-participants-widget-max-participants.constant';
import { type CallParticipantNode } from 'src/front-components/types/call-participant-node.type';
import { type CallParticipantsResult } from 'src/front-components/types/call-participants-result.type';
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

  let fetchedParticipantCount = 0;

  // The API returns one-to-many relations nested under a many-to-one as empty,
  // so participants are read flat by calendarEventId instead of through
  // callRecording.calendarEvent.
  const participants = await fetchAllNodes<CallParticipantNode>(
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
              id: true,
              handle: true,
              displayName: true,
              isOrganizer: true,
              personId: true,
              workspaceMemberId: true,
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

  return { kind: 'loaded', participants };
};
