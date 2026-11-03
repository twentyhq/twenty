import { useState } from 'react';

import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useImpersonationSession } from '@/auth/hooks/useImpersonationSession';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useIsCurrentLocationOnAdminConsole } from '@/domain-manager/hooks/useIsCurrentLocationOnAdminConsole';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useToast } from 'twenty-ui/components/feedback';
import { ImpersonateFromAdminPanelDocument } from '~/generated-admin/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';

export const useHandleImpersonate = () => {
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { enqueueToast } = useToast();
  const { startImpersonating } = useImpersonationSession();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { isOnAdminConsole } = useIsCurrentLocationOnAdminConsole();
  const apolloAdminClient = useApolloAdminClient();
  const [impersonate] = useMutation(ImpersonateFromAdminPanelDocument, {
    client: apolloAdminClient,
  });
  const [impersonatingUserId, setImpersonatingUserId] = useState<string | null>(
    null,
  );

  const handleImpersonate = async (userId: string, workspaceId: string) => {
    if (!isDefined(currentUser?.id) || userId === currentUser.id) {
      enqueueToast({
        status: 'error',
        children: t`You cannot impersonate your own account`,
      });

      return;
    }

    setImpersonatingUserId(userId);

    await impersonate({
      variables: { userId, workspaceId },
      onCompleted: async (data) => {
        const { loginToken, workspace } = data.impersonateFromAdminPanel;
        const isCurrentWorkspace = workspace.id === currentWorkspace?.id;

        // The admin console host holds no workspace session to swap, so the target workspace always opens in its own host.
        if (isCurrentWorkspace && !isOnAdminConsole) {
          await startImpersonating(loginToken.token);

          return;
        }

        return redirectToWorkspaceDomain(
          getWorkspaceUrl(workspace.workspaceUrls),
          AppPath.Verify,
          { loginToken: loginToken.token },
          '_blank',
        );
      },
      onError: (error) => {
        enqueueToast({
          status: 'error',
          children: t`Failed to impersonate user. ${error.message}`,
        });
      },
    }).finally(() => {
      setImpersonatingUserId(null);
    });
  };

  return { handleImpersonate, impersonatingUserId };
};
