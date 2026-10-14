import { useTextFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useTextFieldDisplay';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay/TextDisplay';
import { type FieldDisplayTooltipProps } from '@/ui/field/display/types/FieldDisplayTooltipProps';

type TextFieldDisplayProps = FieldDisplayTooltipProps;

export const TextFieldDisplay = ({
  withTooltip,
  measureOverflowOnOpen,
}: TextFieldDisplayProps) => {
  const { fieldValue, fieldDefinition, displayedMaxRows } =
    useTextFieldDisplay();

  const displayedMaxRowsFromSettings = isFieldText(fieldDefinition)
    ? fieldDefinition.metadata?.settings?.displayedMaxRows
    : undefined;

  const displayMaxRowCalculated = displayedMaxRows
    ? displayedMaxRows
    : displayedMaxRowsFromSettings;

  return (
    <TextDisplay
      text={fieldValue}
      displayedMaxRows={displayMaxRowCalculated}
      withTooltip={withTooltip}
      measureOverflowOnOpen={measureOverflowOnOpen}
    />
  );
};
