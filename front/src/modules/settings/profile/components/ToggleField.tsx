import { getOperationName } from '@apollo/client/utilities';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { Toggle } from '@/ui/input/toggle/components/Toggle';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';
import { GET_CURRENT_USER } from '@/users/queries';
import { useUpdateUserMutation } from '~/generated/graphql';

export function ToggleField() {
  const { enqueueSnackBar } = useSnackBar();

  const currentUser = useRecoilValue(currentUserState);

  const [updateUser] = useUpdateUserMutation();

  async function handleChange(value: boolean) {
    try {
      const { data, errors } = await updateUser({
        variables: {
          where: {
            id: currentUser?.id,
          },
          data: {
            allowImpersonation: value,
          },
        },
        refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
      });

      if (errors || !data?.updateUser) {
        throw new Error('Error while updating user');
      }
    } catch (err: any) {
      enqueueSnackBar(err?.message, {
        variant: 'error',
      });
    }
  }

  return (
    <Toggle value={currentUser?.allowImpersonation} onChange={handleChange} />
  );
}
