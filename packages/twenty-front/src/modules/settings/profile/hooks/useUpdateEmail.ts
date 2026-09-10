import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { t } from '@lingui/core/macro';

import { currentUserState } from '@/auth/states/currentUserState';
import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { useToast } from 'twenty-ui/feedback';
import { UpdateUserEmailDocument } from '~/generated-metadata/graphql';

export const useUpdateEmail = () => {
  const { enqueueToast } = useToast();
  const { enqueueErrorToast } = useErrorToast();

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

      enqueueToast({
        variant: 'info',
        children: t`Check your inbox to verify your new email address.`,
      });
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        enqueueErrorToast(error);
      }
    }
  };

  return {
    updateEmail: handleUpdate,
  };
};
