import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { SubTitle } from '@/auth/components/SubTitle';
import { useMarkSessionActive } from '@/auth/hooks/useMarkSessionActive';
import { OnboardingVerifyLayout } from '@/onboarding/components/OnboardingVerifyLayout';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { SignInToAdminConsoleDocument } from '~/generated-admin/graphql';

export const AdminConsoleSignIn = () => {
  const { t } = useLingui();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const apolloAdminClient = useApolloAdminClient();
  const markSessionActive = useMarkSessionActive();
  const { loadCurrentUser } = useLoadCurrentUser();
  const [signInToAdminConsole] = useMutation(SignInToAdminConsoleDocument, {
    client: apolloAdminClient,
  });

  // oxlint-disable-next-line twenty/no-state-useref
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    const loginToken = searchParams.get('loginToken');
    const adminPanelPath = getSettingsPath(SettingsPath.AdminPanel);
    const returnToPath = searchParams.get('returnToPath');
    const landingPath = returnToPath?.startsWith(adminPanelPath)
      ? returnToPath
      : adminPanelPath;

    if (!isDefined(loginToken)) {
      navigate(AppPath.SignInUp, { replace: true });

      return;
    }

    signInToAdminConsole({ variables: { loginToken } })
      .then(async ({ error }) => {
        if (isDefined(error)) {
          throw error;
        }

        markSessionActive();
        await loadCurrentUser();
        navigate(landingPath, { replace: true });
      })
      .catch(() => {
        navigate(AppPath.SignInUp, { replace: true });
      });
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <OnboardingVerifyLayout>
      <SubTitle>{t`Opening the admin console`}</SubTitle>
    </OnboardingVerifyLayout>
  );
};
