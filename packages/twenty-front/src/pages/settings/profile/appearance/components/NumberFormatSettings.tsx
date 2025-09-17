import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { getNumberFormatFromWorkspaceNumberFormat } from '@/localization/utils/getNumberFormatFromWorkspaceNumberFormat';
import { getWorkspaceNumberFormatFromNumberFormat } from '@/localization/utils/getWorkspaceNumberFormatFromNumberFormat';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { NumberFormatSelect } from '@/settings/experience/components/NumberFormatSelect';
import { useRecoilState } from 'recoil';
import { WorkspaceMemberNumberFormatEnum } from '~/generated/graphql';
import { logError } from '~/utils/logError';

export const NumberFormatSettings = () => {
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const handleNumberFormatChange = async (value: NumberFormat) => {
    if (!currentWorkspaceMember?.id) {
      logError('User is not logged in');
      return;
    }

    const workspaceNumberFormat =
      getWorkspaceNumberFormatFromNumberFormat(value);

    try {
      await updateOneRecord({
        idToUpdate: currentWorkspaceMember.id,
        updateOneRecordInput: {
          numberFormat: workspaceNumberFormat,
        },
      });

      setCurrentWorkspaceMember({
        ...currentWorkspaceMember,
        numberFormat: workspaceNumberFormat,
      });
    } catch (error) {
      logError(error);
    }
  };

  const numberFormat = currentWorkspaceMember?.numberFormat
    ? currentWorkspaceMember.numberFormat ===
      WorkspaceMemberNumberFormatEnum.SYSTEM
      ? NumberFormat.SYSTEM
      : getNumberFormatFromWorkspaceNumberFormat(
          currentWorkspaceMember.numberFormat,
        )
    : NumberFormat.SYSTEM;

  return (
    <NumberFormatSelect
      value={numberFormat}
      onChange={handleNumberFormatChange}
    />
  );
};
