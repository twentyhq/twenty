// import { useJsonField } from '../../hooks/useJsonField';

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
  /* const {
    fieldDefinition,
    draftValue,
    hotkeyScope,
    setDraftValue,
    persistJsonField,
  } = useJsonField(); */

  return <StyledContainer>Field path selector</StyledContainer>;
};
