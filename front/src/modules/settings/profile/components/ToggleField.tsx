import { useRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar/hooks/useSnackBar';
import { Toggle } from '@/ui/input/components/Toggle';

export const ToggleField = () => {
  const { enqueueSnackBar } = useSnackBar();

  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const { updateOneObject, objectNotFoundInMetadata } =
    useUpdateOneObjectRecord({
      objectNameSingular: 'workspaceMemberV2',
    });

  const handleChange = async (value: boolean) => {
    try {
      if (!updateOneObject || objectNotFoundInMetadata) {
        return;
      }
      await updateOneObject({
        idToUpdate: currentWorkspaceMember?.id ?? '',
        input: {
          allowImpersonation: value,
        },
      });
      setCurrentWorkspaceMember(
        (current) =>
          ({
            ...current,
            allowImpersonation: value,
          } as any),
      );
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
