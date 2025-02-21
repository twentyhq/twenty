import { useCallback } from 'react';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useEmailPasswordResetLinkMutation } from '~/generated/graphql';

export const useHandleResetPassword = () => {
  const { enqueueSnackBar } = useSnackBar();
  const [emailPasswordResetLink] = useEmailPasswordResetLinkMutation();
  const { t } = useLingui();

  const handleResetPassword = useCallback(
    (email: string) => {
      return async () => {
        if (!email) {
          enqueueSnackBar(t`Invalid email`, {
            variant: SnackBarVariant.Error,
          });
          return;
        }

        try {
          const { data } = await emailPasswordResetLink({
            variables: { email },
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
    [enqueueSnackBar, emailPasswordResetLink, t],
  );

  return { handleResetPassword };
};
