import { useCallback } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useLingui } from '@lingui/react/macro';
import { useMutation } from '@apollo/client/react';
import { EmailPasswordResetLinkDocument } from '~/generated-metadata/graphql';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useHandleResetPassword = () => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const [emailPasswordResetLink] = useMutation(EmailPasswordResetLinkDocument);
  const workspacePublicData = useAtomStateValue(workspacePublicDataState);
  const currentUser = useAtomStateValue(currentUserState);

  const { t } = useLingui();

  const handleResetPassword = useCallback(
    (email = currentUser?.email) => {
      return async () => {
        if (!email) {
          enqueueErrorSnackBar({
            message: t`Invalid email`,
          });
          return;
        }

        try {
          const { data } = await emailPasswordResetLink({
            variables: workspacePublicData?.id
              ? { email, workspaceId: workspacePublicData.id }
              : { email },
          });

          if (data?.emailPasswordResetLink?.success === true) {
            enqueueSuccessSnackBar({
              message: t`Password reset link has been sent to the email`,
            });
          } else {
            enqueueErrorSnackBar({});
          }
        } catch (error) {
          enqueueErrorSnackBar({
            ...(error instanceof CombinedGraphQLErrors ? { apolloError: error } : {}),
          });
        }
      };
    },
    [
      currentUser?.email,
      workspacePublicData?.id,
      enqueueErrorSnackBar,
      enqueueSuccessSnackBar,
      t,
      emailPasswordResetLink,
    ],
  );

  return { handleResetPassword };
};
