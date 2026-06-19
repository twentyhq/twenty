import { isUndefined } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

type CalendarEventRecordingState = {
  transcript: unknown;
  videoFile: CalendarEventRecordingVideoFile | undefined;
  isCalendarEventRecordingQueryLoading: boolean;
  errorMessage: string | undefined;
};

type CalendarEventRecordingVideoFile = {
  fileId: string;
  label: string | null;
  url: string | null;
  extension: string | null;
};

type CalendarEventRecordingCallRecordingNode = {
  id: string;
  transcript: unknown;
  video: CalendarEventRecordingVideoFile[] | null;
};

type CalendarEventRecordingCallRecordingEdge = {
  node: CalendarEventRecordingCallRecordingNode;
};

const CALENDAR_EVENT_RECORDING_LOOKUP_LIMIT = 10;
const CALENDAR_EVENT_RECORDING_ERROR_MESSAGE = 'Please try again later.';

export const useCalendarEventRecording = (
  calendarEventId: string | undefined,
): CalendarEventRecordingState => {
  const [state, setState] = useState<CalendarEventRecordingState>({
    transcript: undefined,
    videoFile: undefined,
    isCalendarEventRecordingQueryLoading: !isUndefined(calendarEventId),
    errorMessage: undefined,
  });

  useEffect(() => {
    if (isUndefined(calendarEventId)) {
      setState({
        transcript: undefined,
        videoFile: undefined,
        isCalendarEventRecordingQueryLoading: false,
        errorMessage: undefined,
      });
      return;
    }

    let cancelled = false;

    const fetchRecording = async () => {
      setState({
        transcript: undefined,
        videoFile: undefined,
        isCalendarEventRecordingQueryLoading: true,
        errorMessage: undefined,
      });

      try {
        const client = new CoreApiClient();
        const queryResult = await client.query({
          callRecordings: {
            __args: {
              filter: { calendarEventId: { eq: calendarEventId } },
              orderBy: [{ startedAt: 'DescNullsLast' }],
              first: CALENDAR_EVENT_RECORDING_LOOKUP_LIMIT,
            },
            edges: {
              node: {
                id: true,
                transcript: true,
                video: {
                  fileId: true,
                  label: true,
                  url: true,
                  extension: true,
                },
              },
            },
          },
        });

        if (cancelled) {
          return;
        }

        const callRecordingEdges = (queryResult.callRecordings?.edges ??
          []) as CalendarEventRecordingCallRecordingEdge[];
        const callRecordingNodes = callRecordingEdges.map(
          (callRecordingEdge) => callRecordingEdge.node,
        );
        const callRecordingNode = selectCalendarEventRecording(
          callRecordingNodes,
        );

        setState({
          transcript: callRecordingNode?.transcript ?? undefined,
          videoFile: isUndefined(callRecordingNode)
            ? undefined
            : getVideoFile(callRecordingNode),
          isCalendarEventRecordingQueryLoading: false,
          errorMessage: undefined,
        });
      } catch {
        if (cancelled) {
          return;
        }

        setState({
          transcript: undefined,
          videoFile: undefined,
          isCalendarEventRecordingQueryLoading: false,
          errorMessage: CALENDAR_EVENT_RECORDING_ERROR_MESSAGE,
        });
      }
    };

    fetchRecording();

    return () => {
      cancelled = true;
    };
  }, [calendarEventId]);

  return state;
};

const hasTranscript = (
  callRecordingNode: CalendarEventRecordingCallRecordingNode,
): boolean =>
  !isUndefined(callRecordingNode.transcript) &&
  callRecordingNode.transcript !== null;

const getVideoFile = (
  callRecordingNode: CalendarEventRecordingCallRecordingNode,
): CalendarEventRecordingVideoFile | undefined =>
  callRecordingNode.video?.find(
    (videoFile) => !isUndefined(videoFile.url) && videoFile.url !== null,
  );

const selectCalendarEventRecording = (
  callRecordingNodes: CalendarEventRecordingCallRecordingNode[],
): CalendarEventRecordingCallRecordingNode | undefined =>
  callRecordingNodes.find(
    (callRecordingNode) =>
      hasTranscript(callRecordingNode) &&
      !isUndefined(getVideoFile(callRecordingNode)),
  ) ??
  callRecordingNodes.find(hasTranscript) ??
  callRecordingNodes.find(
    (callRecordingNode) => !isUndefined(getVideoFile(callRecordingNode)),
  );
