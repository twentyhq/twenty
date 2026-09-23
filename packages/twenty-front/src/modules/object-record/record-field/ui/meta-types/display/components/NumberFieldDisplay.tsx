import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useNumberFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useNumberFieldDisplay';
import { formatToShortNumber, isDefined } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';

export const NumberFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useNumberFieldDisplay();
  const type = fieldDefinition.metadata.settings?.type;
  const decimals = fieldDefinition.metadata.settings?.decimals;
  const { formatNumber } = useNumberFormat();

  if (!isDefined(fieldValue)) {
    return <Text truncate />;
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

  return <Text truncate>{formattedValue}</Text>;
};
