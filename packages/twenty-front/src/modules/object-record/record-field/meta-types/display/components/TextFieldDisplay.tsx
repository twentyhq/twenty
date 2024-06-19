import { useTextFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useTextFieldDisplay';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay';

export const TextFieldDisplay = () => {
  const { fieldValue, maxWidth } = useTextFieldDisplay();

  return <TextDisplay text={fieldValue} maxWidth={maxWidth} />;
};
