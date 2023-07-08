import { ChangeEvent, ReactElement, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { useMoveSoftFocus } from '@/ui/tables/hooks/useMoveSoftFocus';
import { textInputStyle } from '@/ui/themes/effects';

import { EditableCell } from '../EditableCell';
import { useEditableCell } from '../hooks/useCloseEditableCell';

type OwnProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  onChange: (firstValue: string, secondValue: string) => void;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;

  & > input:last-child {
    border-left: 1px solid ${({ theme }) => theme.border.color.medium};
    padding-left: ${({ theme }) => theme.spacing(2)};
  }
`;

const StyledEditInplaceInput = styled.input`
  height: 18px;
  margin: 0;
  width: 45%;

  ${textInputStyle}
`;

export function EditableDoubleTextEditMode({
  firstValue,
  secondValue,
  firstValuePlaceholder,
  secondValuePlaceholder,
  onChange,
}: OwnProps) {
  const [focusPosition, setFocusPosition] = useState<'left' | 'right'>('left');

  const firstValueInputRef = useRef<HTMLInputElement>(null);
  const secondValueInputRef = useRef<HTMLInputElement>(null);

  const { closeEditableCell } = useEditableCell();
  const { moveRight, moveLeft, moveDown } = useMoveSoftFocus();

  function closeCell() {
    setFocusPosition('left');
    closeEditableCell();
  }

  useScopedHotkeys(
    Key.Enter,
    () => {
      closeCell();
      moveDown();
    },
    InternalHotkeysScope.CellDoubleTextInput,
    [closeCell],
  );

  useScopedHotkeys(
    Key.Escape,
    () => {
      closeCell();
    },
    InternalHotkeysScope.CellDoubleTextInput,
    [closeCell],
  );

  useScopedHotkeys(
    'tab',
    async (keyboardEvent, hotkeyEvent) => {
      console.log({ keyboardEvent, hotkeyEvent });
      console.log({ focusPosition });
      if (focusPosition === 'left') {
        setFocusPosition('right');
        secondValueInputRef.current?.focus();
      } else {
        closeCell();
        moveRight();
      }
    },
    InternalHotkeysScope.CellDoubleTextInput,
    [closeCell, moveRight, focusPosition],
  );

  useScopedHotkeys(
    'shift+tab',
    () => {
      if (focusPosition === 'right') {
        setFocusPosition('left');
        firstValueInputRef.current?.focus();
      } else {
        closeCell();
        moveLeft();
      }
    },
    InternalHotkeysScope.CellDoubleTextInput,
    [closeCell, moveRight, focusPosition],
  );

  return (
    <StyledContainer>
      <StyledEditInplaceInput
        autoFocus
        placeholder={firstValuePlaceholder}
        ref={firstValueInputRef}
        value={firstValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.value, secondValue);
        }}
      />
      <StyledEditInplaceInput
        placeholder={secondValuePlaceholder}
        ref={secondValueInputRef}
        value={secondValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(firstValue, event.target.value);
        }}
      />
    </StyledContainer>
  );
}
