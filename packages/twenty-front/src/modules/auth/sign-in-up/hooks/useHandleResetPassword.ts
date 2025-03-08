import { useCallback } from 'react';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useEmailPasswordResetLinkMutation } from '~/generated/graphql';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useRecoilValue } from 'recoil';
import { currentUserState } from '@/auth/states/currentUserState';

export const useHandleResetPassword = () => {
  const { enqueueSnackBar } = useSnackBar();
  const [emailPasswordResetLink] = useEmailPasswordResetLinkMutation();
  const workspacePublicData = useRecoilValue(workspacePublicDataState);
  const currentUser = useRecoilValue(currentUserState);

  const { t } = useLingui();

  const handleResetPassword = useCallback(
    (email = currentUser?.email) => {
      return async () => {
        if (!email) {
          enqueueSnackBar(t`Invalid email`, {
            variant: SnackBarVariant.Error,
          });
          return;
        }

        if (!workspacePublicData?.id) {
          enqueueSnackBar(t`Invalid workspace`, {
            variant: SnackBarVariant.Error,
          });
          return;
        }

        try {
          const { data } = await emailPasswordResetLink({
            variables: { email, workspaceId: workspacePublicData.id },
          });

          if (data?.emailPasswordResetLink?.success === true) {
            enqueueSnackBar(t`Password reset link has been sent to the email`, {
              variant: SnackBarVariant.Success,
            });
          } else {
            enqueueSnackBar(t`There was an issue`, {
              variant: SnackBarVariant.Error,
            });
          }
        } catch (error) {
          enqueueSnackBar((error as Error).message, {
            variant: SnackBarVariant.Error,
          });
        }
      };
    },
    [
      currentUser?.email,
      workspacePublicData?.id,
      enqueueSnackBar,
      t,
      emailPasswordResetLink,
    ],
  );

  return { handleResetPassword };
};
