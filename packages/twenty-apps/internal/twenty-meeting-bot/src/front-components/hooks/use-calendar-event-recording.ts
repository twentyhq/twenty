import { isUndefined } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

type CalendarEventRecordingState = {
  transcript: unknown;
  videoFile: CalendarEventRecordingVideoFile | undefined;
  loading: boolean;
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

const CALENDAR_EVENT_RECORDING_LOOKUP_LIMIT = 10;

export const useCalendarEventRecording = (
  calendarEventId: string | undefined,
): CalendarEventRecordingState => {
  const [state, setState] = useState<CalendarEventRecordingState>({
    transcript: undefined,
    videoFile: undefined,
    loading: !isUndefined(calendarEventId),
    errorMessage: undefined,
  });

  useEffect(() => {
    if (isUndefined(calendarEventId)) {
      setState({
        transcript: undefined,
        videoFile: undefined,
        loading: false,
        errorMessage: undefined,
      });
      return;
    }

    let cancelled = false;

    const fetchRecording = async () => {
      setState({
        transcript: undefined,
        videoFile: undefined,
        loading: true,
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

        const callRecordingNodes = (queryResult.callRecordings?.edges ?? []).map(
          (edge) => edge.node,
        ) as CalendarEventRecordingCallRecordingNode[];
        const callRecordingNode = selectCalendarEventRecording(
          callRecordingNodes,
        );

        setState({
          transcript: callRecordingNode?.transcript ?? undefined,
          videoFile: isUndefined(callRecordingNode)
            ? undefined
            : getVideoFile(callRecordingNode),
          loading: false,
          errorMessage: undefined,
        });
      } catch (fetchError) {
        if (cancelled) {
          return;
        }

        setState({
          transcript: undefined,
          videoFile: undefined,
          loading: false,
          errorMessage:
            fetchError instanceof Error
              ? fetchError.message
              : 'Failed to load the recording',
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
