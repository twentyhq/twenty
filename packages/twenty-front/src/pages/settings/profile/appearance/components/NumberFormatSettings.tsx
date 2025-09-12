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

  const handleNumberFormatChange = async (value: NumberFormat) => {
    if (!currentWorkspaceMember?.id) {
      logError('User is not logged in');
      return;
    }

    const workspaceNumberFormat =
      value === NumberFormat.SYSTEM
        ? WorkspaceMemberNumberFormatEnum.SYSTEM
        : (value as unknown as WorkspaceMemberNumberFormatEnum);

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

  // Example number to show formatu
  const testNumber = 1234.56;

  const formatLabel = (format: NumberFormat) => {
    if (format === NumberFormat.SYSTEM) {
      return formatNumber(testNumber, detectNumberFormat());
    }
    return formatNumber(testNumber, format);
  };

  const systemFormatLabel = formatLabel(NumberFormat.SYSTEM);
  const commasAndDotLabel = formatLabel(NumberFormat.COMMAS_AND_DOT);
  const spacesAndCommaLabel = formatLabel(NumberFormat.SPACES_AND_COMMA);
  const spacesAndDotLabel = formatLabel(NumberFormat.SPACES_AND_DOT);

  return (
    <Select
      dropdownId="datetime-settings-number-format"
      label={t`Number format`}
      fullWidth
      dropdownWidthAuto
      value={dateTimeFormat.numberFormat}
      options={[
        {
          label: t`System Settings - ${systemFormatLabel}`,
          value: NumberFormat.SYSTEM,
        },
        {
          label: t`Commas and dot (${commasAndDotLabel})`,
          value: NumberFormat.COMMAS_AND_DOT,
        },
        {
          label: t`Spaces and comma (${spacesAndCommaLabel})`,
          value: NumberFormat.SPACES_AND_COMMA,
        },
        {
          label: t`Spaces and dot (${spacesAndDotLabel})`,
          value: NumberFormat.SPACES_AND_DOT,
        },
      ]}
      onChange={handleNumberFormatChange}
    />
  );
};
