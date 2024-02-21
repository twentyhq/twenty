import { useCallback } from 'react';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar.tsx';
import { useEmailPasswordResetLinkMutation } from '~/generated/graphql.tsx';
import useI18n from '@/ui/i18n/useI18n';

export const useHandleResetPassword = () => {
  const { translate } = useI18n('translations');
  const { enqueueSnackBar } = useSnackBar();
  const [emailPasswordResetLink] = useEmailPasswordResetLinkMutation();

  const handleResetPassword = useCallback(
    (email: string) => {
      return async () => {
        if (!email) {
          enqueueSnackBar(translate('invalidEmail'), {
            variant: 'error',
          });
          return;
        }

        try {
          const { data } = await emailPasswordResetLink({
            variables: { email },
          });

          if (data?.emailPasswordResetLink?.success) {
            enqueueSnackBar(translate('passwordResetLinkHasBeenSentToTheEmail'), {
              variant: 'success',
            });
          } else {
            enqueueSnackBar(translate('thereWasSomeIssue'), {
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
