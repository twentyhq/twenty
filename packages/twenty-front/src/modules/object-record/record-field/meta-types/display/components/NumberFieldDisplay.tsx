import { useNumberFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useNumberFieldDisplay';
import { NumberDisplay } from '@/ui/field/display/components/NumberDisplay';

export const NumberFieldDisplay = () => {
  const { fieldValue, maxWidth } = useNumberFieldDisplay();

  return <NumberDisplay value={fieldValue} maxWidth={maxWidth} />;
};
