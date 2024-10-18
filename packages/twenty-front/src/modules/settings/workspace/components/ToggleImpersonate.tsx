import { useRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Toggle } from 'twenty-ui';
import { useUpdateWorkspaceMutation } from '~/generated/graphql';

export const ToggleImpersonate = () => {
  const { enqueueSnackBar } = useSnackBar();

  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const handleChange = async (value: boolean) => {
    try {
      if (!currentWorkspace?.id) {
        throw new Error('User is not logged in');
      }
      await updateWorkspace({
        variables: {
          input: {
            allowImpersonation: value,
          },
        },
      });
      setCurrentWorkspace({
        ...currentWorkspace,
        allowImpersonation: value,
      });
    } catch (err: any) {
      enqueueSnackBar(err?.message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <Toggle
      value={currentWorkspace?.allowImpersonation}
      onChange={handleChange}
    />
  );
};
