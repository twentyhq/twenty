import { isUndefined } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

type CalendarEventTranscriptState = {
  transcript: unknown;
  isCalendarEventTranscriptQueryLoading: boolean;
  errorMessage: string | undefined;
};

type CalendarEventTranscriptCallRecordingNode = {
  id: string;
  transcript: unknown;
};

type CalendarEventTranscriptCallRecordingEdge = {
  node: CalendarEventTranscriptCallRecordingNode;
};

const CALENDAR_EVENT_TRANSCRIPT_LOOKUP_LIMIT = 10;
const CALENDAR_EVENT_TRANSCRIPT_ERROR_MESSAGE = 'Please try again later.';

const hasTranscript = (
  callRecordingNode: CalendarEventTranscriptCallRecordingNode,
): boolean =>
  !isUndefined(callRecordingNode.transcript) &&
  callRecordingNode.transcript !== null;

const selectTranscript = (
  callRecordingNodes: CalendarEventTranscriptCallRecordingNode[],
): unknown => callRecordingNodes.find(hasTranscript)?.transcript ?? undefined;

export const useCalendarEventTranscript = (
  calendarEventId: string | undefined,
): CalendarEventTranscriptState => {
  const [state, setState] = useState<CalendarEventTranscriptState>({
    transcript: undefined,
    isCalendarEventTranscriptQueryLoading: !isUndefined(calendarEventId),
    errorMessage: undefined,
  });

  useEffect(() => {
    if (isUndefined(calendarEventId)) {
      setState({
        transcript: undefined,
        isCalendarEventTranscriptQueryLoading: false,
        errorMessage: undefined,
      });
      return;
    }

    let cancelled = false;

    const fetchTranscript = async () => {
      setState({
        transcript: undefined,
        isCalendarEventTranscriptQueryLoading: true,
        errorMessage: undefined,
      });

      try {
        const client = new CoreApiClient();
        const queryResult = await client.query({
          callRecordings: {
            __args: {
              filter: { calendarEventId: { eq: calendarEventId } },
              orderBy: [{ startedAt: 'DescNullsLast' }],
              first: CALENDAR_EVENT_TRANSCRIPT_LOOKUP_LIMIT,
            },
            edges: {
              node: {
                id: true,
                transcript: true,
              },
            },
          },
        });

        if (cancelled) {
          return;
        }

        const callRecordingEdges = (queryResult.callRecordings?.edges ??
          []) as CalendarEventTranscriptCallRecordingEdge[];
        const callRecordingNodes = callRecordingEdges.map(
          (callRecordingEdge) => callRecordingEdge.node,
        );

        setState({
          transcript: selectTranscript(callRecordingNodes),
          isCalendarEventTranscriptQueryLoading: false,
          errorMessage: undefined,
        });
      } catch {
        if (cancelled) {
          return;
        }

        setState({
          transcript: undefined,
          isCalendarEventTranscriptQueryLoading: false,
          errorMessage: CALENDAR_EVENT_TRANSCRIPT_ERROR_MESSAGE,
        });
      }
    };

    fetchTranscript();

    return () => {
      cancelled = true;
    };
  }, [calendarEventId]);

  return state;
};
