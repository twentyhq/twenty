import { useNumberFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useNumberFieldDisplay';
import { NumberDisplay } from '@/ui/field/display/components/NumberDisplay';

export const NumberFieldDisplay = () => {
  const { fieldValue } = useNumberFieldDisplay();

  return <NumberDisplay value={fieldValue} />;
};
