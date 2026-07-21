import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

type CalendarEventSummaryState = {
  summaryMarkdown: string | undefined;
  isCalendarEventSummaryQueryLoading: boolean;
  errorMessage: string | undefined;
};

type CalendarEventSummaryCallRecordingNode = {
  id: string;
  summary: { markdown: string | null } | null;
};

type CalendarEventSummaryCallRecordingEdge = {
  node: CalendarEventSummaryCallRecordingNode;
};

const CALENDAR_EVENT_SUMMARY_LOOKUP_LIMIT = 10;
const CALENDAR_EVENT_SUMMARY_ERROR_MESSAGE = 'Please try again later.';

const selectSummaryMarkdown = (
  callRecordingNodes: CalendarEventSummaryCallRecordingNode[],
): string | undefined => {
  const summaryMarkdown = callRecordingNodes.find((callRecordingNode) =>
    isNonEmptyString(callRecordingNode.summary?.markdown),
  )?.summary?.markdown;

  return isNonEmptyString(summaryMarkdown) ? summaryMarkdown : undefined;
};

export const useCalendarEventSummary = (
  calendarEventId: string | undefined,
): CalendarEventSummaryState => {
  const [state, setState] = useState<CalendarEventSummaryState>({
    summaryMarkdown: undefined,
    isCalendarEventSummaryQueryLoading: !isUndefined(calendarEventId),
    errorMessage: undefined,
  });

  useEffect(() => {
    if (isUndefined(calendarEventId)) {
      setState({
        summaryMarkdown: undefined,
        isCalendarEventSummaryQueryLoading: false,
        errorMessage: undefined,
      });
      return;
    }

    let cancelled = false;

    const fetchSummary = async () => {
      setState({
        summaryMarkdown: undefined,
        isCalendarEventSummaryQueryLoading: true,
        errorMessage: undefined,
      });

      try {
        const client = new CoreApiClient();
        const queryResult = await client.query({
          callRecordings: {
            __args: {
              filter: { calendarEventId: { eq: calendarEventId } },
              orderBy: [{ startedAt: 'DescNullsLast' }],
              first: CALENDAR_EVENT_SUMMARY_LOOKUP_LIMIT,
            },
            edges: {
              node: {
                id: true,
                summary: { markdown: true },
              },
            },
          },
        });

        if (cancelled) {
          return;
        }

        const callRecordingEdges = (queryResult.callRecordings?.edges ??
          []) as CalendarEventSummaryCallRecordingEdge[];
        const callRecordingNodes = callRecordingEdges.map(
          (callRecordingEdge) => callRecordingEdge.node,
        );

        setState({
          summaryMarkdown: selectSummaryMarkdown(callRecordingNodes),
          isCalendarEventSummaryQueryLoading: false,
          errorMessage: undefined,
        });
      } catch {
        if (cancelled) {
          return;
        }

        setState({
          summaryMarkdown: undefined,
          isCalendarEventSummaryQueryLoading: false,
          errorMessage: CALENDAR_EVENT_SUMMARY_ERROR_MESSAGE,
        });
      }
    };

    fetchSummary();

    return () => {
      cancelled = true;
    };
  }, [calendarEventId]);

  return state;
};
