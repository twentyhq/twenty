import { type CoreApiClient } from 'twenty-client-sdk/core';

import { chunk } from 'src/utils/chunk';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  pickContactTeamMemberId,
  type Participant,
} from 'src/utils/pick-contact-team-member';

const PAGE_SIZE = 200;

export type CalendarEventInteraction = {
  startsAt: string;
  workspaceMemberId: string | null;
};

type CalendarEventParticipantNode = Participant & {
  calendarEventId?: string | null;
  calendarEvent?: {
    startsAt: string | null;
    isCanceled: boolean | null;
  } | null;
};

export const collectCalendarEventInteractions = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<Map<string, CalendarEventInteraction>> => {
  const participantsByCalendarEventId = new Map<
    string,
    CalendarEventParticipantNode[]
  >();

  for (const ids of chunk(calendarEventIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { calendarEventParticipants } = await executeWithRetry(() =>
        client.query({
          calendarEventParticipants: {
            __args: {
              filter: { calendarEventId: { in: ids } },
              first: PAGE_SIZE,
              after,
            },
            edges: {
              node: {
                calendarEventId: true,
                isOrganizer: true,
                workspaceMemberId: true,
                calendarEvent: { startsAt: true, isCanceled: true },
              },
            },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of calendarEventParticipants?.edges ?? []) {
        const node = edge.node as CalendarEventParticipantNode;

        if (!node.calendarEventId) {
          continue;
        }

        const participants = participantsByCalendarEventId.get(
          node.calendarEventId,
        );

        if (participants) {
          participants.push(node);
        } else {
          participantsByCalendarEventId.set(node.calendarEventId, [node]);
        }
      }

      after = calendarEventParticipants?.pageInfo.hasNextPage
        ? (calendarEventParticipants.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  const now = new Date().toISOString();
  const interactionByCalendarEventId = new Map<
    string,
    CalendarEventInteraction
  >();

  for (const [calendarEventId, participants] of participantsByCalendarEventId) {
    const calendarEvent = participants[0]?.calendarEvent;
    const startsAt = calendarEvent?.startsAt ?? null;

    if (!startsAt || calendarEvent?.isCanceled || startsAt > now) {
      continue;
    }

    interactionByCalendarEventId.set(calendarEventId, {
      startsAt,
      workspaceMemberId: pickContactTeamMemberId(participants, {
        isOrganizer: true,
      }),
    });
  }

  return interactionByCalendarEventId;
};
