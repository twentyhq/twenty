import { useAuth } from '@/auth/hooks/useAuth';
import { AppPath } from '@/types/AppPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';

import { verifyEmailRedirectPathState } from '@/app/states/verifyEmailRedirectPathState';
import { useVerifyLogin } from '@/auth/hooks/useVerifyLogin';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { EmailVerificationSent } from '../sign-in-up/components/EmailVerificationSent';

export const VerifyEmailEffect = () => {
  const {
    getLoginTokenFromEmailVerificationToken,
    getWorkspaceAgnosticTokenFromEmailVerificationToken,
  } = useAuth();

  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const [searchParams] = useSearchParams();
  const [isError, setIsError] = useState(false);

  const setVerifyEmailRedirectPath = useSetRecoilState(
    verifyEmailRedirectPathState,
  );

  const email = searchParams.get('email');
  const emailVerificationToken = searchParams.get('emailVerificationToken');
  const verifyEmailRedirectPath = searchParams.get('nextPath');

  const navigate = useNavigateApp();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { verifyLoginToken } = useVerifyLogin();
  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();

  const { t } = useLingui();
  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!email || !emailVerificationToken) {
        enqueueErrorSnackBar({
          message: t`Invalid email verification link.`,
          options: {
            dedupeKey: 'email-verification-link-dedupe-key',
          },
        });
        return navigate(AppPath.SignInUp);
      }

      const successSnackbarParams = {
        message: t`Email verified.`,
        options: {
          dedupeKey: 'email-verification-dedupe-key',
        },
      };

      try {
        if (!isOnAWorkspace) {
          await getWorkspaceAgnosticTokenFromEmailVerificationToken(
            emailVerificationToken,
            email,
          );

          return enqueueSuccessSnackBar(successSnackbarParams);
        }

        const { loginToken, workspaceUrls } =
          await getLoginTokenFromEmailVerificationToken(
            emailVerificationToken,
            email,
          );

        enqueueSuccessSnackBar(successSnackbarParams);

        const workspaceUrl = getWorkspaceUrl(workspaceUrls);
        if (workspaceUrl.slice(0, -1) !== window.location.origin) {
          return await redirectToWorkspaceDomain(workspaceUrl, AppPath.Verify, {
            loginToken: loginToken.token,
          });
        }

        if (isDefined(verifyEmailRedirectPath)) {
          setVerifyEmailRedirectPath(verifyEmailRedirectPath);
        }

        await verifyLoginToken(loginToken.token);
      } catch (error) {
        enqueueErrorSnackBar({
          ...(error instanceof ApolloError
            ? { apolloError: error }
            : { message: t`Email verification failed` }),
          options: {
            dedupeKey: 'email-verification-error-dedupe-key',
          },
        });
        if (
          error instanceof ApolloError &&
          error.graphQLErrors[0].extensions?.subCode ===
            'EMAIL_ALREADY_VERIFIED'
        ) {
          navigate(AppPath.SignInUp);
        }

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
