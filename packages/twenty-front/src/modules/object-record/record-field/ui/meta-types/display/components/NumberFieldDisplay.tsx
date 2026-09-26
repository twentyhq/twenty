import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useNumberFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useNumberFieldDisplay';
import { formatNumberFieldValue } from '@/object-record/record-field/ui/utils/formatNumberFieldValue';
import { formatToShortNumber, isDefined } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';

export const NumberFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useNumberFieldDisplay();
  const settings = fieldDefinition.metadata.settings;
  const { formatNumber } = useNumberFormat();

  if (!isDefined(fieldValue)) {
    return <Text truncate />;
  }

  const numericValue = Number(fieldValue);

  const formattedValue =
    settings?.type === 'shortNumber'
      ? formatToShortNumber(numericValue)
      : formatNumberFieldValue({
          value: numericValue,
          settings,
          formatNumber,
        });

  return <Text truncate>{formattedValue}</Text>;
};
