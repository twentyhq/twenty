import { useCallback } from 'react';

import { useOrigin } from '@/domain-manager/hooks/useOrigin';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { useMutation } from '@apollo/client/react';
import { ResendEmailVerificationTokenDocument } from '~/generated-metadata/graphql';

export const useHandleResendEmailVerificationToken = () => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const [resendEmailVerificationToken, { loading }] =
    useMutation(ResendEmailVerificationTokenDocument);
  const { origin } = useOrigin();

  const handleResendEmailVerificationToken = useCallback(
    (email: string | null) => {
      return async () => {
        if (!email) {
          enqueueErrorSnackBar({
            message: t`Invalid email`,
          });
          return;
        }

        try {
          const { data } = await resendEmailVerificationToken({
            variables: {
              email,
              origin,
            },
          });

          if (data?.resendEmailVerificationToken?.success === true) {
            enqueueSuccessSnackBar({
              message: t`Email verification link resent!`,
            });
          } else {
            enqueueErrorSnackBar({});
          }
        } catch (error) {
          enqueueErrorSnackBar({
            ...(CombinedGraphQLErrors.is(error) ? { apolloError: error } : {}),
          });
        }
      };
    },
    [
      enqueueErrorSnackBar,
      enqueueSuccessSnackBar,
      resendEmailVerificationToken,
      origin,
    ],
  );

  return { handleResendEmailVerificationToken, loading };
};
