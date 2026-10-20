import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { enqueueSnackbar, useTranslate } from 'twenty-sdk/front-component';

import { type CallParticipantNode } from 'src/front-components/types/call-participant-node.type';
import { fetchCallParticipants } from 'src/front-components/utils/fetch-call-participants.util';

type CallParticipantsState =
  | { status: 'loading' }
  | { status: 'error' }
  | {
      status: 'loaded';
      participants: CallParticipantNode[];
      areRelationsLoaded: boolean;
    };

export const useCallParticipants = (
  callRecordingId: string,
): CallParticipantsState => {
  const { t } = useTranslate();
  const [state, setState] = useState<CallParticipantsState>({
    status: 'loading',
  });

  useEffect(() => {
    let isCancelled = false;

    const failLoading = () => {
      setState({ status: 'error' });
      enqueueSnackbar({
        message: t('Could not load call participants.'),
        variant: 'error',
      });
    };

    setState({ status: 'loading' });

    fetchCallParticipants({ client: new CoreApiClient(), callRecordingId })
      .then((result) => {
        if (isCancelled) {
          return;
        }

        switch (result.kind) {
          case 'loaded':
            setState({
              status: 'loaded',
              participants: result.participants,
              areRelationsLoaded: result.areRelationsLoaded,
            });
            return;
          case 'notLinkedToMeeting':
            setState({
              status: 'loaded',
              participants: [],
              areRelationsLoaded: true,
            });
            return;
          case 'callRecordingNotFound':
            failLoading();
            return;
        }
      })
      .catch(() => {
        if (!isCancelled) {
          failLoading();
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [callRecordingId, t]);

  return state;
};
