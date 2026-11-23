import { useCallback } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useGetCaptchaToken } from '@/captcha/hooks/useGetCaptchaToken';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/components/feedback';
import { EmailPasswordResetLinkDocument } from '~/generated-metadata/graphql';

export const useHandleResetPassword = () => {
  const { enqueueToast } = useToast();
  const [emailPasswordResetLink] = useMutation(EmailPasswordResetLinkDocument);
  const workspacePublicData = useAtomStateValue(workspacePublicDataState);
  const currentUser = useAtomStateValue(currentUserState);
  const { getCaptchaToken } = useGetCaptchaToken();

  const { t } = useLingui();

  const handleResetPassword = useCallback(
    (email = currentUser?.email) => {
      return async () => {
        if (!email) {
          enqueueToast({ status: 'error', children: t`Invalid email` });
          return;
        }

        try {
          const captchaToken = await getCaptchaToken();

          const { data } = await emailPasswordResetLink({
            variables: workspacePublicData?.id
              ? { email, workspaceId: workspacePublicData.id, captchaToken }
              : { email, captchaToken },
          });

          if (data?.emailPasswordResetLink?.success === true) {
            enqueueToast({
              status: 'success',
              children: t`If this email is registered, a password reset link has been sent`,
            });
          } else {
            enqueueToast({ status: 'error', children: t`An error occurred.` });
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
      getCaptchaToken,
    ],
  );

  return { handleResetPassword };
};
