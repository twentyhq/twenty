import { ChangeEvent, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { InplaceInputTextEditMode } from '@/ui/inplace-inputs/components/InplaceInputTextEditMode';
import { useMoveSoftFocus } from '@/ui/tables/hooks/useMoveSoftFocus';

import { useEditableCell } from '../hooks/useCloseEditableCell';

type OwnProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  onChange: (firstValue: string, secondValue: string) => void;
  onSubmit?: (firstValue: string, secondValue: string) => void;
  onExit?: () => void;
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
  onExit,
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
      if (onSubmit) {
        onSubmit(firstValue, secondValue);
      }
    },
    InternalHotkeysScope.CellDoubleTextInput,
    [closeCell],
  );

  useScopedHotkeys(
    Key.Escape,
    () => {
      if (onExit) {
        onExit();
      }
      closeCell();
    },
    InternalHotkeysScope.CellDoubleTextInput,
    [closeCell],
  );

  useScopedHotkeys(
    'tab',
    () => {
      if (focusPosition === 'left') {
        setFocusPosition('right');
        secondValueInputRef.current?.focus();
      } else {
        if (onExit) {
          onExit();
        }
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
      <InplaceInputTextEditMode
        autoFocus
        placeholder={firstValuePlaceholder}
        ref={firstValueInputRef}
        value={firstValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.value, secondValue);
        }}
      />
      <InplaceInputTextEditMode
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
