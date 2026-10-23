import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  UpdateUserCreditsFallbackDocument,
  type UserCreditsFallback,
} from '~/generated-metadata/graphql';

export const useUpdateUserCreditsFallback = () => {
  const { enqueueToast } = useToast();
  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);
  const [updateUserCreditsFallbackMutation, { loading }] = useMutation(
    UpdateUserCreditsFallbackDocument,
  );

  const updateUserCreditsFallback = async (
    userCreditsFallback: UserCreditsFallback,
  ) => {
    try {
      const { data } = await updateUserCreditsFallbackMutation({
        variables: { userCreditsFallback },
      });

      const updatedUserCreditsFallback =
        data?.updateUserCreditsFallback.userCreditsFallback;

      if (!isDefined(updatedUserCreditsFallback)) {
        return;
      }

      setCurrentWorkspace((previousWorkspace) =>
        isDefined(previousWorkspace) &&
        isDefined(previousWorkspace.billingCustomer)
          ? {
              ...previousWorkspace,
              billingCustomer: {
                ...previousWorkspace.billingCustomer,
                userCreditsFallback: updatedUserCreditsFallback,
              },
            }
          : previousWorkspace,
      );
    } catch {
      enqueueToast({
        status: 'error',
        children: t`Could not update the user credits setting.`,
      });
    }
  };

  return { updateUserCreditsFallback, loading };
};
