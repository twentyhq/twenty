import { useTextFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useTextFieldDisplay';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay';

export const TextFieldDisplay = () => {
  const { fieldValue, fieldDefinition, displayedMaxRows } =
    useTextFieldDisplay();

  const displayedMaxRowsFromSettings = isFieldText(fieldDefinition)
    ? fieldDefinition.metadata?.settings?.displayedMaxRows
    : undefined;

  return (
    <TextDisplay
      text={fieldValue}
      displayedMaxRows={
        displayedMaxRows ? displayedMaxRows : displayedMaxRowsFromSettings
      }
    />
  );
};
