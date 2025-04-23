import { useAuth } from '@/auth/hooks/useAuth';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { useVerifyLogin } from '@/auth/hooks/useVerifyLogin';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { EmailVerificationSent } from '../sign-in-up/components/EmailVerificationSent';

export const VerifyEmailEffect = () => {
  const { getLoginTokenFromEmailVerificationToken } = useAuth();

  const { enqueueSnackBar } = useSnackBar();

  const [searchParams] = useSearchParams();
  const [isError, setIsError] = useState(false);

  const email = searchParams.get('email');
  const emailVerificationToken = searchParams.get('emailVerificationToken');

  const navigate = useNavigateApp();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { verifyLoginToken } = useVerifyLogin();

  const { t } = useLingui();
  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!email || !emailVerificationToken) {
        enqueueSnackBar(t`Invalid email verification link.`, {
          dedupeKey: 'email-verification-link-dedupe-key',
          variant: SnackBarVariant.Error,
        });
        return navigate(AppPath.SignInUp);
      }

      try {
        const { loginToken, workspaceUrls } =
          await getLoginTokenFromEmailVerificationToken(emailVerificationToken);

        enqueueSnackBar(t`Email verified.`, {
          dedupeKey: 'email-verification-dedupe-key',
          variant: SnackBarVariant.Success,
        });

        const workspaceUrl = getWorkspaceUrl(workspaceUrls);
        if (workspaceUrl.slice(0, -1) !== window.location.origin) {
          return await redirectToWorkspaceDomain(workspaceUrl, AppPath.Verify, {
            loginToken: loginToken.token,
          });
        }
        verifyLoginToken(loginToken.token);
      } catch (error) {
        enqueueSnackBar(t`Email verification failed.`, {
          dedupeKey: 'email-verification-error-dedupe-key',
          variant: SnackBarVariant.Error,
        });
        setIsError(true);
      }
    };

    verifyEmailToken();

    // Verify email only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isError) {
    return (
      <Modal.Content isVerticalCentered isHorizontalCentered>
        <EmailVerificationSent email={email} isError={true} />
      </Modal.Content>
    );
  }

  return <></>;
};
