import { WORKSPACE_ACTIVATION_MESSAGES } from '@/auth/sign-in-up/constants/WorkspaceActivationMessages';
import { type Dispatch, type SetStateAction, useEffect } from 'react';

const MESSAGE_INTERVAL_IN_MS = 1000;

type SignInUpWorkspaceActivationV2EffectProps = {
  messageIndex: number;
  setMessageIndex: Dispatch<SetStateAction<number>>;
};

export const SignInUpWorkspaceActivationV2Effect = ({
  messageIndex,
  setMessageIndex,
}: SignInUpWorkspaceActivationV2EffectProps) => {
  useEffect(() => {
    const isLastMessage =
      messageIndex >= WORKSPACE_ACTIVATION_MESSAGES.length - 1;

    if (isLastMessage) {
      return;
    }

    const timeout = setTimeout(() => {
      setMessageIndex((previousIndex) => previousIndex + 1);
    }, MESSAGE_INTERVAL_IN_MS);

    return () => clearTimeout(timeout);
  }, [messageIndex, setMessageIndex]);

  return <></>;
};
