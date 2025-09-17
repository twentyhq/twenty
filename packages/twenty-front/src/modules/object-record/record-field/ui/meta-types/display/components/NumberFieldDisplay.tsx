import { useNumberFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useNumberFieldDisplay';
import { NumberDisplay } from '@/ui/field/display/components/NumberDisplay';
import { isDefined } from 'twenty-shared/utils';
import { formatAmount } from '~/utils/format/formatAmount';
import { formatNumberLocalized } from '~/utils/format/number';
import { useRecoilState } from 'recoil';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getNumberFormatFromWorkspaceNumberFormat } from '@/localization/utils/getNumberFormatFromWorkspaceNumberFormat';

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
    formattedValue = `${formatNumberLocalized(numericValue * 100, getNumberFormatFromWorkspaceNumberFormat(currentWorkspaceMember?.numberFormat!), decimals)}%`;
  } else if (type === 'shortNumber') {
    formattedValue = formatAmount(numericValue);
  } else {
    formattedValue = formatNumberLocalized(
      numericValue,
      getNumberFormatFromWorkspaceNumberFormat(
        currentWorkspaceMember?.numberFormat!,
      ),
      decimals,
    );
  }

  return <NumberDisplay value={formattedValue} />;
};
