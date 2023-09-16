import { ChangeEvent, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { useMoveSoftFocus } from '@/ui/table/hooks/useMoveSoftFocus';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

import { StyledInput } from '../../../../input/components/TextInput';
import { useEditableCell } from '../../hooks/useEditableCell';
import { useRegisterCloseCellHandlers } from '../../hooks/useRegisterCloseCellHandlers';

type OwnProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  onChange?: (firstValue: string, secondValue: string) => void;
  onSubmit?: (firstValue: string, secondValue: string) => void;
  onCancel?: () => void;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;

  input {
    width: ${({ theme }) => theme.spacing(24)};
  }

  & > input:last-child {
    border-left: 1px solid ${({ theme }) => theme.border.color.medium};
    padding-left: ${({ theme }) => theme.spacing(2)};
  }
`;

export const DoubleTextCellEdit = ({
  firstValue,
  secondValue,
  firstValuePlaceholder,
  secondValuePlaceholder,
  onSubmit,
  onCancel,
}: OwnProps) => {
  const [firstInternalValue, setFirstInternalValue] = useState(firstValue);
  const [secondInternalValue, setSecondInternalValue] = useState(secondValue);

  useEffect(() => {
    setFirstInternalValue(firstValue);
    setSecondInternalValue(secondValue);
  }, [firstValue, secondValue]);

  const handleOnChange = (
    newFirstValue: string,
    newSecondValue: string,
  ): void => {
    setFirstInternalValue(newFirstValue);
    setSecondInternalValue(newSecondValue);
  };

  const [focusPosition, setFocusPosition] = useState<'left' | 'right'>('left');

  const firstValueInputRef = useRef<HTMLInputElement>(null);
  const secondValueInputRef = useRef<HTMLInputElement>(null);

  const { closeEditableCell } = useEditableCell();
  const { moveRight, moveLeft, moveDown } = useMoveSoftFocus();

  const closeCell = () => {
    setFocusPosition('left');
    closeEditableCell();
  };

  const handleCancel = () => {
    setFirstInternalValue(firstValue);
    setSecondInternalValue(secondValue);

    onCancel?.();
  };

  const handleSubmit = () => {
    onSubmit?.(firstInternalValue, secondInternalValue);
  };

  useScopedHotkeys(
    Key.Enter,
    () => {
      closeCell();
      moveDown();
      handleSubmit();
    },
    TableHotkeyScope.CellDoubleTextInput,
    [closeCell],
  );

  useScopedHotkeys(
    Key.Escape,
    () => {
      handleCancel();
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
        handleSubmit();

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
        handleSubmit();
        closeCell();
        moveLeft();
      }
    },
    TableHotkeyScope.CellDoubleTextInput,
    [closeCell, moveRight, focusPosition],
  );

  const wrapperRef = useRef(null);

  useRegisterCloseCellHandlers(wrapperRef, handleSubmit, handleCancel);

  return (
    <StyledContainer ref={wrapperRef}>
      <StyledInput
        autoComplete="off"
        autoFocus
        placeholder={firstValuePlaceholder}
        ref={firstValueInputRef}
        value={firstInternalValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          handleOnChange(event.target.value, secondInternalValue);
        }}
      />
      <StyledInput
        autoComplete="off"
        placeholder={secondValuePlaceholder}
        ref={secondValueInputRef}
        value={secondInternalValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          handleOnChange(firstInternalValue, event.target.value);
        }}
      />
    </StyledContainer>
  );
};
