import { useCallback } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useCaptcha } from '@/client-config/hooks/useCaptcha';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useLingui } from '@lingui/react/macro';
import { useMutation } from '@apollo/client/react';
import { EmailPasswordResetLinkDocument } from '~/generated-metadata/graphql';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useHandleResetPassword = () => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const [emailPasswordResetLink] = useMutation(EmailPasswordResetLinkDocument);
  const workspacePublicData = useAtomStateValue(workspacePublicDataState);
  const currentUser = useAtomStateValue(currentUserState);
  const { isCaptchaReady } = useCaptcha();
  const { readCaptchaToken } = useReadCaptchaToken();

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

        if (!isCaptchaReady) {
          enqueueErrorSnackBar({
            message: t`Captcha (anti-bot check) is still loading, try again`,
          });
          return;
        }

        const captchaToken = readCaptchaToken();

        try {
          const { data } = await emailPasswordResetLink({
            variables: workspacePublicData?.id
              ? { email, workspaceId: workspacePublicData.id, captchaToken }
              : { email, captchaToken },
          });

          if (data?.emailPasswordResetLink?.success === true) {
            enqueueSuccessSnackBar({
              message: t`If this email is registered, a password reset link has been sent`,
            });
          } else {
            enqueueErrorSnackBar({});
          }
        } catch (error) {
          enqueueErrorSnackBar(
            CombinedGraphQLErrors.is(error)
              ? { apolloError: error }
              : { message: error instanceof Error ? error.message : undefined },
          );
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
      isCaptchaReady,
      readCaptchaToken,
    ],
  );

  return { handleResetPassword };
};
