import { ApolloError } from '@apollo/client';

import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useUpdateUserEmailMutation } from '~/generated-metadata/graphql';

export const useUpdateEmail = () => {
  const { enqueueErrorSnackBar, enqueueInfoSnackBar } = useSnackBar();

  const currentUser = useRecoilValue(currentUserState);
  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );

  const [updateUserEmail] = useUpdateUserEmailMutation();

  const handleUpdate = async (email: string) => {
    if (!currentUser) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail || trimmedEmail === currentUser.email) {
      return;
    }

    try {
      await updateUserEmail({
        variables: {
          newEmail: trimmedEmail,
        },
      });

      setCurrentUser((prev) =>
        prev ? { ...prev, email: trimmedEmail } : prev,
      );
      setCurrentWorkspaceMember((prev) =>
        prev ? { ...prev, userEmail: trimmedEmail } : prev,
      );

      enqueueInfoSnackBar({
        message: 'Check your inbox to verify your new email address.',
      });
    } catch (error) {
      if (error instanceof ApolloError) {
        enqueueErrorSnackBar({ apolloError: error });
      }
    }
  };

  return {
    updateEmail: handleUpdate,
  };
};
