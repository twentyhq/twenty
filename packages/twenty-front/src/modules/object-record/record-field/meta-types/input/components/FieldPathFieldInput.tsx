// import { useJsonField } from '../../hooks/useJsonField';

import { FieldPathPicker } from '@/object-record/field-path-picker/components/FieldPathPicker';
import { useFieldPathField } from '@/object-record/record-field/meta-types/hooks/useFieldPathField';
import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import styled from '@emotion/styled';
import { useRef } from 'react';
import { FieldInputEvent } from './DateFieldInput';

const StyledContainer = styled.div`
  /*   left: -1px;
  position: absolute;
  top: -1px; */
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

  const wrapperRef = useRef<HTMLDivElement>(null);

  useRegisterInputEvents({
    inputRef: wrapperRef,
    onClickOutside: () => onClickOutside?.(() => {}),
    onEnter: onEnter as any,
    onEscape: onEscape as any,
    onTab,
    onShiftTab,
    hotkeyScope,
    inputValue: () => {},
  });

  return (
    <StyledContainer ref={wrapperRef}>
      <FieldPathPicker
        draftValue={draftValue}
        setDraftValue={setDraftValue}
        fieldDefinition={fieldDefinition}
        fieldValue={fieldValue}
        setFieldValue={setFieldValue}
        hotkeyScope={hotkeyScope}
        sourceObjectNameSingular={sourceObjectNameSingular}
        onClickOutside={onClickOutside}
      />
    </StyledContainer>
  );
};
