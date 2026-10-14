import { useArrayFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useArrayFieldDisplay';
import { ArrayDisplay } from '@/ui/field/display/components/ArrayDisplay';

export const ArrayFieldDisplay = () => {
  const { fieldValue } = useArrayFieldDisplay();

  if (!Array.isArray(fieldValue)) {
    return <></>;
  }

  return <ArrayDisplay value={fieldValue} />;
};
