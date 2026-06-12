import { isUndefined } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

type CallRecordingTranscriptState = {
  transcript: unknown;
  loading: boolean;
  errorMessage: string | undefined;
};

export const useCallRecordingTranscript = (
  callRecordingId: string | undefined,
): CallRecordingTranscriptState => {
  const [state, setState] = useState<CallRecordingTranscriptState>({
    transcript: undefined,
    loading: !isUndefined(callRecordingId),
    errorMessage: undefined,
  });

  useEffect(() => {
    if (isUndefined(callRecordingId)) {
      setState({
        transcript: undefined,
        loading: false,
        errorMessage: undefined,
      });
      return;
    }

    let cancelled = false;

    const fetchTranscript = async () => {
      setState({
        transcript: undefined,
        loading: true,
        errorMessage: undefined,
      });

      try {
        const client = new CoreApiClient();
        const queryResult = await client.query({
          callRecordings: {
            __args: {
              filter: { id: { eq: callRecordingId } },
              first: 1,
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

        const callRecordingNode = queryResult.callRecordings?.edges?.[0]?.node;

        if (isUndefined(callRecordingNode)) {
          setState({
            transcript: undefined,
            loading: false,
            errorMessage: 'Call recording not found',
          });
          return;
        }

        setState({
          transcript: callRecordingNode.transcript ?? undefined,
          loading: false,
          errorMessage: undefined,
        });
      } catch (fetchError) {
        if (cancelled) {
          return;
        }

        setState({
          transcript: undefined,
          loading: false,
          errorMessage:
            fetchError instanceof Error
              ? fetchError.message
              : 'Failed to load the transcript',
        });
      }
    };

    fetchTranscript();

    return () => {
      cancelled = true;
    };
  }, [callRecordingId]);

  return state;
};
