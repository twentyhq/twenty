import { useState } from 'react';

import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useImpersonationSession } from '@/auth/hooks/useImpersonationSession';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ImpersonateDocument } from '~/generated-metadata/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';

export const useHandleImpersonate = () => {
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { enqueueErrorSnackBar } = useSnackBar();
  const { startImpersonating } = useImpersonationSession();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const [impersonate] = useMutation(ImpersonateDocument);
  const [impersonatingUserId, setImpersonatingUserId] = useState<string | null>(
    null,
  );

  const handleImpersonate = async (userId: string, workspaceId: string) => {
    if (!isDefined(currentUser?.id) || userId === currentUser.id) {
      enqueueErrorSnackBar({
        message: t`You cannot impersonate your own account`,
      });

      return;
    }

    setImpersonatingUserId(userId);

    await impersonate({
      variables: { userId, workspaceId },
      onCompleted: async (data) => {
        const { loginToken, workspace } = data.impersonate;
        const isCurrentWorkspace = workspace.id === currentWorkspace?.id;

        if (isCurrentWorkspace) {
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
        enqueueErrorSnackBar({
          message: `Failed to impersonate user. ${error.message}`,
        });
      },
    }).finally(() => {
      setImpersonatingUserId(null);
    });
  };

  return { handleImpersonate, impersonatingUserId };
};
