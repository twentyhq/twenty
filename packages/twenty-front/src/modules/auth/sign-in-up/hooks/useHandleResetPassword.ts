import { useCallback } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { useEmailPasswordResetLinkMutation } from '~/generated-metadata/graphql';

export const useHandleResetPassword = () => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const [emailPasswordResetLink] = useEmailPasswordResetLinkMutation();
  const workspacePublicData = useRecoilValue(workspacePublicDataState);
  const currentUser = useRecoilValue(currentUserState);

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

        if (!workspacePublicData?.id) {
          enqueueErrorSnackBar({
            message: t`Invalid workspace`,
          });
          return;
        }

        try {
          const { data } = await emailPasswordResetLink({
            variables: { email, workspaceId: workspacePublicData.id },
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
            ...(error instanceof ApolloError ? { apolloError: error } : {}),
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
