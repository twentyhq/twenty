import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSwitchWorkspaceMutation } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { useUrlManager } from '@/url-manager/hooks/useUrlManager';

export const useWorkspaceSwitching = () => {
  const [switchWorkspaceMutation] = useSwitchWorkspaceMutation();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { enqueueSnackBar } = useSnackBar();
  const { redirectToHome, redirectToWorkspace } = useUrlManager();

  const switchWorkspace = async (workspaceId: string) => {
    if (currentWorkspace?.id === workspaceId) return;

    if (!isMultiWorkspaceEnabled) {
      return enqueueSnackBar(
        'Switching workspace is not available in single workspace mode',
        {
          variant: SnackBarVariant.Error,
        },
      );
    }

    const { data, errors } = await switchWorkspaceMutation({
      variables: {
        workspaceId,
      },
    });

    if (isDefined(errors) || !isDefined(data?.switchWorkspace.subdomain)) {
      return redirectToHome();
    }

    redirectToWorkspace(data.switchWorkspace.subdomain);
  };

  return { switchWorkspace };
};
