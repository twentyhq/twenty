import { useCallback } from 'react';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useEmailPasswordResetLinkMutation } from '~/generated/graphql.tsx';

export const useHandleResetPassword = () => {
  const { enqueueSnackBar } = useSnackBar();
  const [emailPasswordResetLink] = useEmailPasswordResetLinkMutation();

  const handleResetPassword = useCallback(
    (email: string) => {
      return async () => {
        if (!email) {
          enqueueSnackBar('Invalid email', {
            variant: 'error',
          });
          return;
        }

        try {
          const { data } = await emailPasswordResetLink({
            variables: { email },
          });

          if (data?.emailPasswordResetLink?.success === true) {
            enqueueSnackBar('Password reset link has been sent to the email', {
              variant: 'success',
            });
          } else {
            enqueueSnackBar('There was some issue', {
              variant: 'error',
            });
          }
        } catch (error) {
          enqueueSnackBar((error as Error).message, {
            variant: 'error',
          });
        }
      };
    },
    [enqueueSnackBar, emailPasswordResetLink],
  );

  return { handleResetPassword };
};
