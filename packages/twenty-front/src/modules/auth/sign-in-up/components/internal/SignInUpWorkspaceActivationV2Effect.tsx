import { WORKSPACE_ACTIVATION_MESSAGES } from '@/auth/sign-in-up/constants/WorkspaceActivationMessages';
import { signInUpWorkspaceActivationMessageIndexState } from '@/auth/states/signInUpWorkspaceActivationMessageIndexState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';

const MESSAGE_INTERVAL_IN_MS = 1000;

export const SignInUpWorkspaceActivationV2Effect = () => {
  const signInUpWorkspaceActivationMessageIndex = useAtomStateValue(
    signInUpWorkspaceActivationMessageIndexState,
  );
  const setSignInUpWorkspaceActivationMessageIndex = useSetAtomState(
    signInUpWorkspaceActivationMessageIndexState,
  );

  useEffect(() => {
    return () => {
      setSignInUpWorkspaceActivationMessageIndex(0);
    };
  }, [setSignInUpWorkspaceActivationMessageIndex]);

  useEffect(() => {
    const isLastMessage =
      signInUpWorkspaceActivationMessageIndex >=
      WORKSPACE_ACTIVATION_MESSAGES.length - 1;

    if (isLastMessage) {
      return;
    }

    const timeout = setTimeout(() => {
      setSignInUpWorkspaceActivationMessageIndex(
        (previousIndex) => previousIndex + 1,
      );
    }, MESSAGE_INTERVAL_IN_MS);

    return () => clearTimeout(timeout);
  }, [
    signInUpWorkspaceActivationMessageIndex,
    setSignInUpWorkspaceActivationMessageIndex,
  ]);

  return <></>;
};
