import { verifyEmailRedirectPathState } from '@/app/states/verifyEmailRedirectPathState';
import { useAuth } from '@/auth/hooks/useAuth';
import { useVerifyLogin } from '@/auth/hooks/useVerifyLogin';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast, type ToastOptions } from 'twenty-ui/components';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

type VerifyEmailEffectProps = {
  onError: () => void;
};

const EMAIL_VERIFICATION_ERROR_DEDUPE_KEY =
  'email-verification-error-dedupe-key';

export const VerifyEmailEffect = ({ onError }: VerifyEmailEffectProps) => {
  const {
    verifyEmailAndGetLoginToken,
    verifyEmailAndGetWorkspaceAgnosticToken,
  } = useAuth();

  const { enqueueToast } = useToast();

  const [searchParams] = useSearchParams();

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
        enqueueToast({
          variant: 'error',
          children: t`Invalid email verification link.`,
          dedupeKey: 'email-verification-link-dedupe-key',
        });
        return navigate(AppPath.SignInUp);
      }

      const successToastOptions = {
        variant: 'success',
        children: t`Email verified.`,
        dedupeKey: 'email-verification-dedupe-key',
      } satisfies ToastOptions;

      try {
        if (!isOnAWorkspace) {
          await verifyEmailAndGetWorkspaceAgnosticToken(
            emailVerificationToken,
            email,
          );

          enqueueToast(successToastOptions);

          return navigate(AppPath.SignInUp);
        }

        const { loginToken, workspaceUrls } = await verifyEmailAndGetLoginToken(
          emailVerificationToken,
          email,
        );

        enqueueToast(successToastOptions);

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
        enqueueToast(
          CombinedGraphQLErrors.is(error)
            ? getToastOptionsFromError({
                error,
                dedupeKey: EMAIL_VERIFICATION_ERROR_DEDUPE_KEY,
              })
            : {
                variant: 'error',
                children: t`Email verification failed`,
                dedupeKey: EMAIL_VERIFICATION_ERROR_DEDUPE_KEY,
              },
        );
        if (isGraphqlErrorOfType(error, 'EMAIL_ALREADY_VERIFIED')) {
          navigate(AppPath.SignInUp);
        }

        onError();
      }
    };

    if (!clientConfigApiStatus.isLoadedOnce) {
      return;
    }

    verifyEmailToken();

    // Verify email only needs to run once at mount
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [clientConfigApiStatus.isLoadedOnce]);

  return <></>;
};
