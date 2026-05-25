import { useAuth } from '@/auth/hooks/useAuth';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { AppPath } from 'twenty-shared/types';

import { verifyEmailRedirectPathState } from '@/app/states/verifyEmailRedirectPathState';
import { useVerifyLogin } from '@/auth/hooks/useVerifyLogin';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { ModalContent } from 'twenty-ui/layout';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';
import { EmailVerificationSent } from '@/auth/sign-in-up/components/EmailVerificationSent';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const VerifyEmailEffect = () => {
  const {
    verifyEmailAndGetLoginToken,
    verifyEmailAndGetWorkspaceAgnosticToken,
  } = useAuth();

  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const [searchParams] = useSearchParams();
  const [isError, setIsError] = useState(false);

  const setVerifyEmailRedirectPath = useSetAtomState(
    verifyEmailRedirectPathState,
  );

  const email = searchParams.get('email');
  const emailVerificationToken = searchParams.get('emailVerificationToken');
  const verifyEmailRedirectPath = searchParams.get('nextPath');

  const navigate = useNavigateApp();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { verifyLoginToken } = useVerifyLogin();
  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();
  const clientConfigApiStatus = useAtomStateValue(clientConfigApiStatusState);

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
          await verifyEmailAndGetWorkspaceAgnosticToken(
            emailVerificationToken,
            email,
          );

          return enqueueSuccessSnackBar(successSnackbarParams);
        }

        const { loginToken, workspaceUrls } = await verifyEmailAndGetLoginToken(
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
          ...(CombinedGraphQLErrors.is(error)
            ? { apolloError: error }
            : { message: t`Email verification failed` }),
          options: {
            dedupeKey: 'email-verification-error-dedupe-key',
          },
        });
        if (isGraphqlErrorOfType(error, 'EMAIL_ALREADY_VERIFIED')) {
          navigate(AppPath.SignInUp);
        }

        setIsError(true);
      }
    };

    if (!clientConfigApiStatus.isLoadedOnce) {
      return;
    }

    verifyEmailToken();

    // Verify email only needs to run once at mount
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [clientConfigApiStatus.isLoadedOnce]);

  if (isError) {
    return (
      <ModalContent isVerticallyCentered isHorizontallyCentered>
        <EmailVerificationSent email={email} isError={true} />
      </ModalContent>
    );
  }

  return <></>;
};
