import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { detectNumberFormat } from '@/localization/utils/detectNumberFormat';
import {
  getNumberFormatFromWorkspaceNumberFormat,
  getWorkspaceNumberFormatFromNumberFormat,
} from '@/localization/utils/getNumberFormatFromWorkspaceNumberFormat';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState } from 'recoil';
import { formatNumberLocalized } from '~/utils/format/number';
import { logError } from '~/utils/logError';

export const NumberFormatSettings = () => {
  const { t } = useLingui();

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const systemNumberFormatLabel = formatNumberLocalized(
    1234.56,
    detectNumberFormat(),
    2,
  );

  const handleNumberFormatChange = async (value: NumberFormat) => {
    if (!currentWorkspaceMember?.id) {
      logError('User is not logged in');
      return;
    }

    const originalChoice = getWorkspaceNumberFormatFromNumberFormat(value);

    const resolvedFormat =
      value === NumberFormat.SYSTEM
        ? getWorkspaceNumberFormatFromNumberFormat(detectNumberFormat())
        : originalChoice;

    try {
      await updateOneRecord({
        idToUpdate: currentWorkspaceMember.id,
        updateOneRecordInput: {
          numberFormat: resolvedFormat,
        },
      });

      setCurrentWorkspaceMember({
        ...currentWorkspaceMember,
        numberFormat: resolvedFormat,
        originalNumberFormatChoice: originalChoice,
      });
    } catch (error) {
      logError(error);
    }
  };

  const formatChoice =
    currentWorkspaceMember?.originalNumberFormatChoice ??
    currentWorkspaceMember?.numberFormat;

  const numberFormat = formatChoice
    ? getNumberFormatFromWorkspaceNumberFormat(formatChoice)
    : NumberFormat.SYSTEM;

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
          label: t`Dots and comma (1.234,56)`,
          value: NumberFormat.DOTS_AND_COMMA,
        },
        {
          label: t`Apostrophe and dot (1'234.56)`,
          value: NumberFormat.APOSTROPHE_AND_DOT,
        },
      ]}
      onChange={handleNumberFormatChange}
    />
  );
};
