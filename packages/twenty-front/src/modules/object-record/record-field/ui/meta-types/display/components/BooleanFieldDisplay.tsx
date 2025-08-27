import { BooleanDisplay } from '@/object-record/record-field/ui/meta-types/display/components/BooleanDisplay';
import { useBooleanFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useBooleanFieldDisplay';

export const BooleanFieldDisplay = () => {
  const { fieldValue } = useBooleanFieldDisplay();

  return <BooleanDisplay value={fieldValue} />;
};
