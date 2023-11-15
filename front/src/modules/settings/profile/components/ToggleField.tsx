import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useSnackBar } from '@/ui/feedback/snack-bar/hooks/useSnackBar';
import { Toggle } from '@/ui/input/components/Toggle';
import { useUpdateAllowImpersonationMutation } from '~/generated/graphql';

export const ToggleField = () => {
  const { enqueueSnackBar } = useSnackBar();

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [updateAllowImpersonation] = useUpdateAllowImpersonationMutation();

  const handleChange = async (value: boolean) => {
    try {
      const { data, errors } = await updateAllowImpersonation({
        variables: {
          allowImpersonation: value,
        },
      });

      if (errors || !data?.allowImpersonation) {
        throw new Error('Error while updating user');
      }
    } catch (err: any) {
      enqueueSnackBar(err?.message, {
        variant: 'error',
      });
    }
  };

  return (
    <Toggle
      value={currentWorkspaceMember?.allowImpersonation}
      onChange={handleChange}
    />
  );
};
