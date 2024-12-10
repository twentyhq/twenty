import { useNumberFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useNumberFieldDisplay';
import { NumberDisplay } from '@/ui/field/display/components/NumberDisplay';
import { isDefined } from 'twenty-ui';
import { formatNumber } from '~/utils/format/number';

export const NumberFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useNumberFieldDisplay();
  const decimals = fieldDefinition.metadata.settings?.decimals;
  const type = fieldDefinition.metadata.settings?.type;

  if (!isDefined(fieldValue))
    return <NumberDisplay value={null} decimals={decimals} />;
  const value =
    type === 'percentage'
      ? `${formatNumber(Number(fieldValue) * 100, decimals)}%`
      : formatNumber(Number(fieldValue), decimals);

  return <NumberDisplay value={value} decimals={decimals} />;
};
