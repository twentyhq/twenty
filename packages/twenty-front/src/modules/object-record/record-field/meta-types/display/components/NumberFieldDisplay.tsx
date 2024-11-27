import { useNumberFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useNumberFieldDisplay';
import { NumberDisplay } from '@/ui/field/display/components/NumberDisplay';
import { formatNumber } from '~/utils/format/number';

export const NumberFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useNumberFieldDisplay();
  const decimals = fieldDefinition.metadata.settings?.decimals;
  const type = fieldDefinition.metadata.settings?.type;
  const value =
    type === 'percentage' && fieldValue
      ? `${formatNumber(Number(fieldValue) * 100, decimals)}%`
      : fieldValue
        ? formatNumber(Number(fieldValue), decimals)
        : null;
  return <NumberDisplay value={value} decimals={decimals} />;
};
