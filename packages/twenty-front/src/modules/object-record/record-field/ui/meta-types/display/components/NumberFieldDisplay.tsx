import { useContext } from 'react';
import { useNumberFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useNumberFieldDisplay';
import { NumberDisplay } from '@/ui/field/display/components/NumberDisplay';
import { UserContext } from '@/users/contexts/UserContext';
import { isDefined } from 'twenty-shared/utils';
import { formatNumber } from '@/localization/utils/formatNumber';
import { NumberFormat } from '@/localization/constants/NumberFormat';

export const NumberFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useNumberFieldDisplay();
  const { numberFormat } = useContext(UserContext);
  const type = fieldDefinition.metadata.settings?.type;

  if (!isDefined(fieldValue)) {
    return <NumberDisplay value={null} />;
  }

  const numericValue = Number(fieldValue);
  let formattedValue: string;

  if (type === 'percentage') {
    formattedValue = `${formatNumber(numericValue * 100, numberFormat)}%`;
  } else if (type === 'shortNumber') {
    formattedValue = formatNumber(
      numericValue,
      NumberFormat.MAGNITUDE_SUFFIXES,
    );
  } else {
    formattedValue = formatNumber(numericValue, numberFormat);
  }

  return (
    <div>
      <NumberDisplay value={formattedValue} />
    </div>
  );
};
