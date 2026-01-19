import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useNumberFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useNumberFieldDisplay';
import { NumberDisplay } from '@/ui/field/display/components/NumberDisplay';
import { formatToShortNumber, isDefined } from 'twenty-shared/utils';

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

  return <NumberDisplay value={formattedValue} />;
};
