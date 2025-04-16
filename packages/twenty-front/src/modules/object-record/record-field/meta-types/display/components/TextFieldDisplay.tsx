import { useTextFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useTextFieldDisplay';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay';

export const TextFieldDisplay = () => {
  const { fieldValue, fieldDefinition, displayedMaxRows } =
    useTextFieldDisplay();

  const displayedMaxRowsFromSettings = isFieldText(fieldDefinition)
    ? fieldDefinition.metadata?.settings?.displayedMaxRows
    : undefined;

  const displayMaxRowCalculated = displayedMaxRows
    ? displayedMaxRows
    : displayedMaxRowsFromSettings;
  return displayMaxRowCalculated && displayMaxRowCalculated > 1 ? (
    <TextDisplay text={fieldValue} displayedMaxRows={displayMaxRowCalculated} />
  ) : (
    <TextDisplay text={fieldValue} displayedMaxRows={displayMaxRowCalculated} />
  );
};
