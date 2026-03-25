import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { t } from '@lingui/core/macro';

import { currentUserState } from '@/auth/states/currentUserState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client/react';
import { UpdateUserEmailDocument } from '~/generated-metadata/graphql';

export const useUpdateEmail = () => {
  const { enqueueErrorSnackBar, enqueueInfoSnackBar } = useSnackBar();

  const currentUser = useAtomStateValue(currentUserState);

  const [updateUserEmail] = useMutation(UpdateUserEmailDocument);

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
      if (CombinedGraphQLErrors.is(error)) {
        enqueueErrorSnackBar({ apolloError: error });
      }
    }
  };

  return {
    updateEmail: handleUpdate,
  };
};
