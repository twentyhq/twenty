import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { useMarkSessionActive } from '@/auth/hooks/useMarkSessionActive';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { useToast } from 'twenty-ui/components/feedback';
import { SignInToAdminConsoleDocument } from '~/generated-admin/graphql';

export const AdminConsoleSignInEffect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { enqueueToast } = useToast();
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
      .catch((error: Error) => {
        enqueueToast({
          status: 'error',
          children: t`Could not open the admin console. ${error.message}`,
        });
        navigate(AppPath.SignInUp, { replace: true });
      });
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
