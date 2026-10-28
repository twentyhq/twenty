import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { useEffect } from 'react';
import {
  GettingStartedStep,
  GettingStartedStepStatus,
} from '~/generated-metadata/graphql';

export const GettingStartedMailboxConnectedEffect = () => {
  const { updateGettingStarted } = useUpdateGettingStarted();

  useEffect(() => {
    void updateGettingStarted({
      stepStatus: {
        step: GettingStartedStep.CONNECT_MAILBOX,
        status: GettingStartedStepStatus.DONE,
      },
    });
  }, [updateGettingStarted]);

  return null;
};
