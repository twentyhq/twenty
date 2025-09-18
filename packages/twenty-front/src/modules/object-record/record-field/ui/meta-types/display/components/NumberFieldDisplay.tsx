import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getNumberFormatFromWorkspaceNumberFormat } from '@/localization/utils/getNumberFormatFromWorkspaceNumberFormat';
import { useNumberFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useNumberFieldDisplay';
import { NumberDisplay } from '@/ui/field/display/components/NumberDisplay';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { formatToShortNumber } from '~/utils/format/formatToShortNumber';
import { formatNumber } from '~/utils/format/formatNumber';

export const NumberFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useNumberFieldDisplay();
  const [currentWorkspaceMember] = useRecoilState(currentWorkspaceMemberState);
  const type = fieldDefinition.metadata.settings?.type;
  const decimals = fieldDefinition.metadata.settings?.decimals;

  if (!isDefined(fieldValue)) {
    return <NumberDisplay value={null} />;
  }

  const numericValue = Number(fieldValue);
  let formattedValue: string;

  if (type === 'percentage') {
    formattedValue = `${formatNumber(numericValue * 100, getNumberFormatFromWorkspaceNumberFormat(currentWorkspaceMember?.numberFormat!), decimals)}%`;
  } else if (type === 'shortNumber') {
    formattedValue = formatToShortNumber(numericValue);
  } else {
    formattedValue = formatNumber(
      numericValue,
      getNumberFormatFromWorkspaceNumberFormat(
        currentWorkspaceMember?.numberFormat!,
      ),
      decimals,
    );
  }

  return <NumberDisplay value={formattedValue} />;
};
