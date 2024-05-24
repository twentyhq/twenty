import { useCallback } from 'react';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useEmailPasswordResetLinkMutation } from '~/generated/graphql';

export const useHandleResetPassword = () => {
  const { enqueueSnackBar } = useSnackBar();
  const [emailPasswordResetLink] = useEmailPasswordResetLinkMutation();

  const handleResetPassword = useCallback(
    (email: string) => {
      return async () => {
        if (!email) {
          enqueueSnackBar('Invalid email', {
            variant: SnackBarVariant.Error,
          });
          return;
        }

        try {
          const { data } = await emailPasswordResetLink({
            variables: { email },
          });

          if (data?.emailPasswordResetLink?.success === true) {
            enqueueSnackBar('Password reset link has been sent to the email', {
              variant: SnackBarVariant.Success,
            });
          } else {
            enqueueSnackBar('There was some issue', {
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
    [enqueueSnackBar, emailPasswordResetLink],
  );

  return { handleResetPassword };
};
