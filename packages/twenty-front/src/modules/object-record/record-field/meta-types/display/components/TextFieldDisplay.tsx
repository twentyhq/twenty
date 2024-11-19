import { useTextFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useTextFieldDisplay';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay';

export const TextFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useTextFieldDisplay();

  return (
    <TextDisplay
      text={fieldValue}
      displayedMaxRows={fieldDefinition.metadata?.settings?.displayedMaxRows}
    />
  );
};
