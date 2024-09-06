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
          enqueueSnackBar('Email inválido', {
            variant: SnackBarVariant.Error,
          });
          return;
        }

        try {
          const { data } = await emailPasswordResetLink({
            variables: { email },
          });

          if (data?.emailPasswordResetLink?.success === true) {
            enqueueSnackBar('Link para redefinição de senha foi enviado para o email', {
              variant: SnackBarVariant.Success,
            });
          } else {
            enqueueSnackBar('Houve um problema', {
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
