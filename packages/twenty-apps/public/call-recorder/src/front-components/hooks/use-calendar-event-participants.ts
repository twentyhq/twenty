import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { type CalendarEventRecordingParticipant } from 'src/front-components/types/calendar-event-recording-participant.type';
import { getAbsoluteAvatarUrl } from 'src/front-components/utils/get-absolute-avatar-url.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const CALENDAR_EVENT_PARTICIPANT_LOOKUP_LIMIT = 100;

type CalendarEventParticipantName = {
  firstName?: string | null;
  lastName?: string | null;
};

type CalendarEventParticipantRelatedRecord = {
  id?: string | null;
  avatarUrl?: string | null;
  name?: CalendarEventParticipantName | null;
};

type CalendarEventParticipantNode = {
  id: string;
  displayName?: string | null;
  handle?: string | null;
  personId?: string | null;
  workspaceMemberId?: string | null;
  person?: CalendarEventParticipantRelatedRecord | null;
  workspaceMember?: CalendarEventParticipantRelatedRecord | null;
};

type CalendarEventParticipantEdge = {
  node: CalendarEventParticipantNode;
};

type UseCalendarEventParticipantsReturn = {
  calendarEventParticipants: CalendarEventRecordingParticipant[];
};

export const useCalendarEventParticipants = (
  calendarEventId: string | undefined,
): UseCalendarEventParticipantsReturn => {
  const [calendarEventParticipants, setCalendarEventParticipants] = useState<
    CalendarEventRecordingParticipant[]
  >([]);

  useEffect(() => {
    if (!isNonEmptyString(calendarEventId)) {
      setCalendarEventParticipants([]);
      return;
    }

    let cancelled = false;

    const fetchCalendarEventParticipants = async () => {
      try {
        const client = new CoreApiClient();
        const queryResult = await client.query({
          calendarEventParticipants: {
            __args: {
              filter: { calendarEventId: { eq: calendarEventId } },
              first: CALENDAR_EVENT_PARTICIPANT_LOOKUP_LIMIT,
            },
            edges: {
              node: {
                id: true,
                displayName: true,
                handle: true,
                personId: true,
                workspaceMemberId: true,
                person: {
                  id: true,
                  avatarUrl: true,
                  name: {
                    firstName: true,
                    lastName: true,
                  },
                },
                workspaceMember: {
                  id: true,
                  avatarUrl: true,
                  name: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        });

        if (cancelled) {
          return;
        }

        const calendarEventParticipantEdges = (queryResult
          .calendarEventParticipants?.edges ??
          []) as CalendarEventParticipantEdge[];

        setCalendarEventParticipants(
          calendarEventParticipantEdges.map((calendarEventParticipantEdge) =>
            mapCalendarEventParticipantNode(calendarEventParticipantEdge.node),
          ),
        );
      } catch {
        if (cancelled) {
          return;
        }

        setCalendarEventParticipants([]);
      }
    };

    fetchCalendarEventParticipants();

    return () => {
      cancelled = true;
    };
  }, [calendarEventId]);

  return { calendarEventParticipants };
};

const mapCalendarEventParticipantNode = (
  calendarEventParticipantNode: CalendarEventParticipantNode,
): CalendarEventRecordingParticipant => {
  const personName = readFullName(calendarEventParticipantNode.person?.name);
  const workspaceMemberName = readFullName(
    calendarEventParticipantNode.workspaceMember?.name,
  );
  const calendarDisplayName = readOptionalString(
    calendarEventParticipantNode.displayName,
  );
  const handle = readOptionalString(calendarEventParticipantNode.handle);

  return {
    id: calendarEventParticipantNode.id,
    avatarUrl: getAbsoluteAvatarUrl(
      calendarEventParticipantNode.person?.avatarUrl ??
        calendarEventParticipantNode.workspaceMember?.avatarUrl,
    ),
    displayName:
      personName ?? workspaceMemberName ?? calendarDisplayName ?? handle,
    nameCandidates: [
      calendarDisplayName,
      personName,
      workspaceMemberName,
      handle,
    ].filter((nameCandidate): nameCandidate is string =>
      isNonEmptyString(nameCandidate),
    ),
    placeholderColorSeed:
      calendarEventParticipantNode.workspaceMemberId ??
      calendarEventParticipantNode.personId ??
      calendarEventParticipantNode.id,
  };
};

const readFullName = (
  name: CalendarEventParticipantName | null | undefined,
): string | undefined => {
  const firstName = readOptionalString(name?.firstName);
  const lastName = readOptionalString(name?.lastName);
  const fullName = [firstName, lastName]
    .filter((namePart): namePart is string => isNonEmptyString(namePart))
    .join(' ');

  return isNonEmptyString(fullName) ? fullName : undefined;
};

const readOptionalString = (
  value: string | null | undefined,
): string | undefined => (isNonEmptyString(value) ? value.trim() : undefined);
