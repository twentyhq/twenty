import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { usePhonesFieldDisplay } from '@/object-record/record-field/meta-types/hooks/usePhonesFieldDisplay';
import { PhonesDisplay } from '@/ui/field/display/components/PhonesDisplay';

export const PhonesFieldDisplay = () => {
  const { fieldValue } = usePhonesFieldDisplay();

  const { isFocused } = useFieldFocus();

  return <PhonesDisplay value={fieldValue} isFocused={isFocused} />;
};
