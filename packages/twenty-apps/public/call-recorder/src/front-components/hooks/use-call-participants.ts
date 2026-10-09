import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { type CallParticipantNode } from 'src/front-components/types/call-participant-node.type';
import { fetchCallParticipants } from 'src/front-components/utils/fetch-call-participants.util';

type CallParticipantsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'notLinkedToMeeting' }
  | { status: 'loaded'; participants: CallParticipantNode[] };

export const useCallParticipants = (
  callRecordingId: string,
): CallParticipantsState => {
  const [state, setState] = useState<CallParticipantsState>({
    status: 'loading',
  });

  useEffect(() => {
    let isCancelled = false;

    setState({ status: 'loading' });

    fetchCallParticipants(new CoreApiClient(), { callRecordingId })
      .then((result) => {
        if (isCancelled) {
          return;
        }

        switch (result.kind) {
          case 'loaded':
            setState({ status: 'loaded', participants: result.participants });
            return;
          case 'notLinkedToMeeting':
            setState({ status: 'notLinkedToMeeting' });
            return;
          case 'callRecordingNotFound':
            setState({ status: 'error' });
            return;
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setState({ status: 'error' });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [callRecordingId]);

  return state;
};
