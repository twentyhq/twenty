import { useCallback } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useCaptcha } from '@/client-config/hooks/useCaptcha';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/primitives/feedback';
import { EmailPasswordResetLinkDocument } from '~/generated-metadata/graphql';

export const useHandleResetPassword = () => {
  const { enqueueToast } = useToast();
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
          enqueueToast({ variant: 'error', children: t`Invalid email` });
          return;
        }

        if (!isCaptchaReady) {
          enqueueToast({
            variant: 'error',
            children: t`Captcha (anti-bot check) is still loading, try again`,
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
            enqueueToast({
              variant: 'success',
              children: t`If this email is registered, a password reset link has been sent`,
            });
          } else {
            enqueueToast({ variant: 'error', children: t`An error occurred.` });
          }
        } catch (error) {
          enqueueToast(getToastOptionsFromError({ error }));
        }
      };
    },
    [
      currentUser?.email,
      workspacePublicData?.id,
      enqueueToast,
      t,
      emailPasswordResetLink,
      isCaptchaReady,
      readCaptchaToken,
    ],
  );

  return { handleResetPassword };
};
