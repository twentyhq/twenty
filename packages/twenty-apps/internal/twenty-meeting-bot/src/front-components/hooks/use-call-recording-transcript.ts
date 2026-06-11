import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

type CallRecordingTranscriptState = {
  transcript: unknown;
  loading: boolean;
  errorMessage: string | null;
};

export const useCallRecordingTranscript = (
  callRecordingId: string | null,
): CallRecordingTranscriptState => {
  const [state, setState] = useState<CallRecordingTranscriptState>({
    transcript: null,
    loading: callRecordingId !== null,
    errorMessage: null,
  });

  useEffect(() => {
    if (callRecordingId === null) {
      setState({ transcript: null, loading: false, errorMessage: null });
      return;
    }

    let cancelled = false;

    const fetchTranscript = async () => {
      setState({ transcript: null, loading: true, errorMessage: null });

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

        if (callRecordingNode === undefined) {
          setState({
            transcript: null,
            loading: false,
            errorMessage: 'Call recording not found',
          });
          return;
        }

        setState({
          transcript: callRecordingNode.transcript ?? null,
          loading: false,
          errorMessage: null,
        });
      } catch (fetchError) {
        if (cancelled) {
          return;
        }

        setState({
          transcript: null,
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
