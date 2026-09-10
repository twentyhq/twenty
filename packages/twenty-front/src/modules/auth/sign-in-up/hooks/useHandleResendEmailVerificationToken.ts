import { useCallback } from 'react';

import { useOrigin } from '@/domain-manager/hooks/useOrigin';
import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useToast } from 'twenty-ui/feedback';
import { ResendEmailVerificationTokenDocument } from '~/generated-metadata/graphql';

export const useHandleResendEmailVerificationToken = () => {
  const { enqueueToast } = useToast();
  const { enqueueErrorToast } = useErrorToast();
  const [resendEmailVerificationToken, { loading }] = useMutation(
    ResendEmailVerificationTokenDocument,
  );
  const { origin } = useOrigin();

  const handleResendEmailVerificationToken = useCallback(
    (email: string | null) => {
      return async () => {
        if (!email) {
          enqueueToast({ variant: 'error', children: t`Invalid email` });
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
            enqueueToast({
              variant: 'success',
              children: t`Email verification link resent!`,
            });
          } else {
            enqueueToast({ variant: 'error', children: t`An error occurred.` });
          }
        } catch (error) {
          if (CombinedGraphQLErrors.is(error)) {
            enqueueErrorToast(error);
          } else {
            enqueueToast({
              variant: 'error',
              children:
                (error instanceof Error ? error.message : undefined) ??
                t`An error occurred.`,
            });
          }
        }
      };
    },
    [enqueueToast, enqueueErrorToast, resendEmailVerificationToken, origin],
  );

  return { handleResendEmailVerificationToken, loading };
};
