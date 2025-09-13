import { detectNumberFormat } from '@/localization/utils/detectNumberFormat';
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { WorkspaceMemberNumberFormatEnum } from '~/generated/graphql';
import { logError } from '~/utils/logError';
import { useRecoilState } from 'recoil';
import { dateTimeFormatState } from '@/localization/states/dateTimeFormatState';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { formatNumber } from '@/localization/utils/formatNumber';

export const NumberFormatSettings = () => {
  const { t } = useLingui();
  const [dateTimeFormat, setDateTimeFormat] =
    useRecoilState(dateTimeFormatState);

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const systemNumberFormatLabel = formatNumber(
    1234.56,
    detectNumberFormat(),
    2,
  );

  const handleNumberFormatChange = async (value: NumberFormat) => {
    if (!currentWorkspaceMember?.id) {
      logError('User is not logged in');
      return;
    }

    const workspaceNumberFormat =
      value === NumberFormat.SYSTEM
        ? WorkspaceMemberNumberFormatEnum.SYSTEM
        : WorkspaceMemberNumberFormatEnum[
            value as keyof typeof WorkspaceMemberNumberFormatEnum
          ];

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

      setDateTimeFormat((prev) => ({
        ...prev,
        numberFormat: value,
      }));
    } catch (error) {
      logError(error);
    }
  };

  const numberFormat =
    currentWorkspaceMember?.numberFormat ===
    WorkspaceMemberNumberFormatEnum.SYSTEM
      ? NumberFormat.SYSTEM
      : dateTimeFormat.numberFormat;

  return (
    <Select
      dropdownId="datetime-settings-number-format"
      label={t`Number format`}
      fullWidth
      dropdownWidthAuto
      value={numberFormat}
      options={[
        {
          label: t`System Settings - ${systemNumberFormatLabel}`,
          value: NumberFormat.SYSTEM,
        },
        {
          label: t`Commas and dot (1,234.56)`,
          value: NumberFormat.COMMAS_AND_DOT,
        },
        {
          label: t`Spaces and comma (1 234,56)`,
          value: NumberFormat.SPACES_AND_COMMA,
        },
        {
          label: t`Spaces and dot (1 234.56)`,
          value: NumberFormat.SPACES_AND_DOT,
        },
      ]}
      onChange={handleNumberFormatChange}
    />
  );
};
