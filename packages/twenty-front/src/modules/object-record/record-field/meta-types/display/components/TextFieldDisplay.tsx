import { useTextFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useTextFieldDisplay';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay';
import styled from '@emotion/styled';

const StyledTextDisplay = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
`;

const StyledTextDisplayAdaptive = styled.div`
  align-items: center;
  display: flex;
  min-height: 20px;
`;

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
    <StyledTextDisplayAdaptive>
      <TextDisplay
        text={fieldValue}
        displayedMaxRows={displayMaxRowCalculated}
      />
    </StyledTextDisplayAdaptive>
  ) : (
    <StyledTextDisplay>
      <TextDisplay
        text={fieldValue}
        displayedMaxRows={displayMaxRowCalculated}
      />
    </StyledTextDisplay>
  );
};
