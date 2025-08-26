import { useBooleanFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useBooleanFieldDisplay';
import { BooleanDisplay } from 'twenty-ui/fields';

export const BooleanFieldDisplay = () => {
  const { fieldValue } = useBooleanFieldDisplay();

  return <BooleanDisplay value={fieldValue} />;
};
