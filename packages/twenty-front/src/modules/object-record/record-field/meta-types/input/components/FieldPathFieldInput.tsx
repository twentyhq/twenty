// import { useJsonField } from '../../hooks/useJsonField';

import { FieldPathPicker } from '@/object-record/field-path-picker/components/FieldPathPicker';
import { useFieldPathField } from '@/object-record/record-field/meta-types/hooks/useFieldPathField';
import styled from '@emotion/styled';
import { FieldInputEvent } from './DateFieldInput';

const StyledContainer = styled.div`
  left: -1px;
  position: absolute;
  top: -1px;
`;

export type FieldPathFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const FieldPathFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: FieldPathFieldInputProps) => {
  const {
    draftValue,
    setDraftValue,
    fieldDefinition,
    fieldValue,
    setFieldValue,
    hotkeyScope,
    sourceObjectNameSingular,
  } = useFieldPathField();

  return (
    <StyledContainer>
      <FieldPathPicker
        draftValue={draftValue}
        setDraftValue={setDraftValue}
        fieldDefinition={fieldDefinition}
        fieldValue={fieldValue}
        setFieldValue={setFieldValue}
        hotkeyScope={hotkeyScope}
        sourceObjectNameSingular={sourceObjectNameSingular}
      />
    </StyledContainer>
  );
};
