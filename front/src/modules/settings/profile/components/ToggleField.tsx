import { useRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Toggle } from '@/ui/input/components/Toggle';

export const ToggleField = () => {
  const { enqueueSnackBar } = useSnackBar();

  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const { updateOneObject, objectNotFoundInMetadata } =
    useUpdateOneObjectRecord({
      objectNameSingular: 'workspaceMember',
    });

  const handleChange = async (value: boolean) => {
    try {
      if (!updateOneObject || objectNotFoundInMetadata) {
        throw new Error('Object not found in metadata');
      }
      if (!currentWorkspaceMember?.id) {
        throw new Error('User is not logged in');
      }
      await updateOneObject({
        idToUpdate: currentWorkspaceMember?.id,
        input: {
          allowImpersonation: value,
        },
      });
      setCurrentWorkspaceMember({
        ...currentWorkspaceMember,
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
      value={currentWorkspaceMember?.allowImpersonation}
      onChange={handleChange}
    />
  );
};
