import { useCallback } from 'react';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useResendEmailVerificationTokenMutation } from '~/generated/graphql';

export const useHandleResendEmailVerificationToken = () => {
  const { enqueueSnackBar } = useSnackBar();
  const [resendEmailVerificationToken, { loading }] =
    useResendEmailVerificationTokenMutation();

  const handleResendEmailVerificationToken = useCallback(
    (email: string | null) => {
      return async () => {
        if (!email) {
          enqueueSnackBar(t`Invalid email`, {
            variant: SnackBarVariant.Error,
          });
          return;
        }

        try {
          const { data } = await resendEmailVerificationToken({
            variables: { email },
          });

          if (data?.resendEmailVerificationToken?.success === true) {
            enqueueSnackBar(t`Email verification link resent!`, {
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
    [enqueueSnackBar, resendEmailVerificationToken],
  );

  return { handleResendEmailVerificationToken, loading };
};
