import { useNumberFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useNumberFieldDisplay';
import { NumberDisplay } from '@/ui/field/display/components/NumberDisplay';
import { formatNumber } from '~/utils/format/number';

export const NumberFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useNumberFieldDisplay();
  const decimals = fieldDefinition.metadata.settings?.decimals;
  const type = fieldDefinition.metadata.settings?.type;
  
  if (!fieldValue) return <NumberDisplay value={null} />;
  
  const numericValue = Number(fieldValue);
  if (Number.isNaN(numericValue)) return <NumberDisplay value={null} />;
  
  const value = type === 'percentage'
    ? `${formatNumber(numericValue * 100, decimals)}%`
    : formatNumber(numericValue, decimals);
    
  return <NumberDisplay value={value} decimals={decimals} />;
};
