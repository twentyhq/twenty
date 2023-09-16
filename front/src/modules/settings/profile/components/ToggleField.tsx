import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { Toggle } from '@/ui/input/components/Toggle';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';
import { useUpdateAllowImpersonationMutation } from '~/generated/graphql';

export const ToggleField = () => {
  const { enqueueSnackBar } = useSnackBar();

  const currentUser = useRecoilValue(currentUserState);

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
      value={currentUser?.workspaceMember?.allowImpersonation}
      onChange={handleChange}
    />
  );
};
