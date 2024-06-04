import { useBooleanField } from '@/object-record/record-field/meta-types/hooks/useBooleanField';
import { BooleanDisplay } from '@/ui/field/display/components/BooleanDisplay';

export const BooleanFieldDisplay = () => {
  const { fieldValue } = useBooleanField();

  return <BooleanDisplay value={fieldValue} />;
};
