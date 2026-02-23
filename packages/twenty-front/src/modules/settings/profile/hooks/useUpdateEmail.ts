import { ApolloError } from '@apollo/client';

import { t } from '@lingui/core/macro';

import { currentUserState } from '@/auth/states/currentUserState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useUpdateUserEmailMutation } from '~/generated-metadata/graphql';

export const useUpdateEmail = () => {
  const { enqueueErrorSnackBar, enqueueInfoSnackBar } = useSnackBar();

  const currentUser = useRecoilValueV2(currentUserState);

  const [updateUserEmail] = useUpdateUserEmailMutation();

  const handleUpdate = async (email: string) => {
    if (!currentUser) {
      return;
    }

    try {
      await updateUserEmail({
        variables: {
          newEmail: email,
        },
      });

      enqueueInfoSnackBar({
        message: t`Check your inbox to verify your new email address.`,
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
