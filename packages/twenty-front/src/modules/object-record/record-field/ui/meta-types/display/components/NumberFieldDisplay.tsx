import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useNumberFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useNumberFieldDisplay';
import { isLoanToValueRatioField } from '@/object-record/record-field/ui/types/guards/isLoanToValueRatioField';
import { NumberDisplay } from '@/ui/field/display/components/NumberDisplay';
import { formatToShortNumber, isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const NumberFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useNumberFieldDisplay();
  const type = fieldDefinition.metadata.settings?.type;
  const decimals = fieldDefinition.metadata.settings?.decimals;
  const { formatNumber } = useNumberFormat();

  if (!isDefined(fieldValue)) {
    return <NumberDisplay value={null} />;
  }

  const numericValue = Number(fieldValue);
  let formattedValue: string;

  if (type === 'percentage') {
    formattedValue = `${formatNumber(numericValue * 100, { decimals })}%`;
  } else if (type === 'shortNumber') {
    formattedValue = formatToShortNumber(numericValue);
  } else {
    formattedValue = formatNumber(numericValue, { decimals });
  }

  const isHighLoanToValueRatio =
    isLoanToValueRatioField(fieldDefinition) && numericValue > 1;

  return (
    <NumberDisplay
      value={formattedValue}
      color={
        isHighLoanToValueRatio ? themeCssVariables.font.color.danger : undefined
      }
    />
  );
};
