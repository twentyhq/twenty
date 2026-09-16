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
};

const collectPastStartsAt = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<Map<string, string>> => {
  const startsAtByCalendarEventId = new Map<string, string>();
  const now = new Date().toISOString();

  for (const ids of chunk(calendarEventIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { calendarEvents } = await executeWithRetry(() =>
        client.query({
          calendarEvents: {
            __args: {
              filter: {
                id: { in: ids },
                startsAt: { lte: now },
                isCanceled: { eq: false },
              },
              first: PAGE_SIZE,
              after,
            },
            edges: { node: { id: true, startsAt: true } },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of calendarEvents?.edges ?? []) {
        const { id, startsAt } = edge.node;

        if (id && startsAt) {
          startsAtByCalendarEventId.set(id, startsAt);
        }
      }

      after = calendarEvents?.pageInfo.hasNextPage
        ? (calendarEvents.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return startsAtByCalendarEventId;
};

const collectMemberParticipants = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<Map<string, CalendarEventParticipantNode[]>> => {
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
              filter: {
                calendarEventId: { in: ids },
                workspaceMemberId: { is: 'NOT_NULL' },
              },
              first: PAGE_SIZE,
              after,
            },
            edges: {
              node: {
                calendarEventId: true,
                isOrganizer: true,
                workspaceMemberId: true,
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

  return participantsByCalendarEventId;
};

// Resolves a batch of calendar events at once, dropping the ones that have not
// started yet or were canceled: a meeting only counts as a contact once it happened.
export const collectCalendarEventInteractions = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<Map<string, CalendarEventInteraction>> => {
  if (calendarEventIds.length === 0) {
    return new Map();
  }

  const startsAtByCalendarEventId = await collectPastStartsAt(
    client,
    calendarEventIds,
  );
  const pastCalendarEventIds = [...startsAtByCalendarEventId.keys()];

  if (pastCalendarEventIds.length === 0) {
    return new Map();
  }

  const participantsByCalendarEventId = await collectMemberParticipants(
    client,
    pastCalendarEventIds,
  );

  const interactionByCalendarEventId = new Map<
    string,
    CalendarEventInteraction
  >();

  for (const [calendarEventId, startsAt] of startsAtByCalendarEventId) {
    interactionByCalendarEventId.set(calendarEventId, {
      startsAt,
      workspaceMemberId: pickContactTeamMemberId(
        participantsByCalendarEventId.get(calendarEventId) ?? [],
        { isOrganizer: true },
      ),
    });
  }

  return interactionByCalendarEventId;
};
