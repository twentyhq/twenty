import { useRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import useI18n from '@/ui/i18n/useI18n';
import { Toggle } from '@/ui/input/components/Toggle';
import { useUpdateWorkspaceMutation } from '~/generated/graphql';

export const ToggleImpersonate = () => {
  const { enqueueSnackBar } = useSnackBar();
  const { translate } = useI18n('translations');
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const handleChange = async (value: boolean) => {
    try {
      if (!currentWorkspace?.id) {
        throw new Error(translate('userIsNotLoggedIn'));
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
        variant: 'error',
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
