import { ChangeEvent, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/ui/hotkey/hooks/useScopedHotkeys';
import { StyledInput } from '@/ui/inplace-input/components/InplaceInputTextEditMode';

import { useMoveSoftFocus } from '../../hooks/useMoveSoftFocus';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { useEditableCell } from '../hooks/useEditableCell';

type OwnProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  onChange: (firstValue: string, secondValue: string) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
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

export function EditableCellDoubleTextEditMode({
  firstValue,
  secondValue,
  firstValuePlaceholder,
  secondValuePlaceholder,
  onChange,
  onSubmit,
  onCancel,
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
      onSubmit?.();
    },
    TableHotkeyScope.CellDoubleTextInput,
    [closeCell],
  );

  useScopedHotkeys(
    Key.Escape,
    () => {
      onCancel?.();
      closeCell();
    },
    TableHotkeyScope.CellDoubleTextInput,
    [closeCell],
  );

  useScopedHotkeys(
    'tab',
    () => {
      if (focusPosition === 'left') {
        setFocusPosition('right');
        secondValueInputRef.current?.focus();
      } else {
        onSubmit?.();
        closeCell();
        moveRight();
      }
    },
    TableHotkeyScope.CellDoubleTextInput,
    [closeCell, moveRight, focusPosition],
  );

  useScopedHotkeys(
    'shift+tab',
    () => {
      if (focusPosition === 'right') {
        setFocusPosition('left');
        firstValueInputRef.current?.focus();
      } else {
        onSubmit?.();
        closeCell();
        moveLeft();
      }
    },
    TableHotkeyScope.CellDoubleTextInput,
    [closeCell, moveRight, focusPosition],
  );

  return (
    <StyledContainer>
      <StyledInput
        autoFocus
        placeholder={firstValuePlaceholder}
        ref={firstValueInputRef}
        value={firstValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.value, secondValue);
        }}
      />
      <StyledInput
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
