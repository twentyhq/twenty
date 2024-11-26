import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';

export const useWorkspaceSwitching = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { enqueueSnackBar } = useSnackBar();

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
  };

  return { switchWorkspace };
};
