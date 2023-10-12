import { ChangeEvent, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { FieldDoubleText } from '@/ui/field/types/FieldDoubleText';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from '~/utils/isDefined';

import { StyledInput } from './TextInput';

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

type DoubleTextInputProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  hotkeyScope: string;
  onEnter: (newDoubleTextValue: FieldDoubleText) => void;
  onEscape: (newDoubleTextValue: FieldDoubleText) => void;
  onTab?: (newDoubleTextValue: FieldDoubleText) => void;
  onShiftTab?: (newDoubleTextValue: FieldDoubleText) => void;
  onClickOutside: (
    event: MouseEvent | TouchEvent,
    newDoubleTextValue: FieldDoubleText,
  ) => void;
};

export const DoubleTextInput = ({
  firstValue,
  secondValue,
  firstValuePlaceholder,
  secondValuePlaceholder,
  hotkeyScope,
  onClickOutside,
  onEnter,
  onEscape,
  onShiftTab,
  onTab,
}: DoubleTextInputProps) => {
  const [firstInternalValue, setFirstInternalValue] = useState(firstValue);
  const [secondInternalValue, setSecondInternalValue] = useState(secondValue);

  const firstValueInputRef = useRef<HTMLInputElement>(null);
  const secondValueInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFirstInternalValue(firstValue);
    setSecondInternalValue(secondValue);
  }, [firstValue, secondValue]);

  const handleChange = (
    newFirstValue: string,
    newSecondValue: string,
  ): void => {
    setFirstInternalValue(newFirstValue);
    setSecondInternalValue(newSecondValue);
  };

  const [focusPosition, setFocusPosition] = useState<'left' | 'right'>('left');

  useScopedHotkeys(
    Key.Enter,
    () => {
      onEnter({
        firstValue: firstInternalValue,
        secondValue: secondInternalValue,
      });
    },
    hotkeyScope,
    [onEnter, firstInternalValue, secondInternalValue],
  );

  useScopedHotkeys(
    Key.Escape,
    () => {
      onEscape({
        firstValue: firstInternalValue,
        secondValue: secondInternalValue,
      });
    },
    hotkeyScope,
    [onEscape, firstInternalValue, secondInternalValue],
  );

  useScopedHotkeys(
    'tab',
    () => {
      if (focusPosition === 'left') {
        setFocusPosition('right');
        secondValueInputRef.current?.focus();
      } else {
        onTab?.({
          firstValue: firstInternalValue,
          secondValue: secondInternalValue,
        });
      }
    },
    hotkeyScope,
    [onTab, firstInternalValue, secondInternalValue, focusPosition],
  );

  useScopedHotkeys(
    'shift+tab',
    () => {
      if (focusPosition === 'right') {
        setFocusPosition('left');
        firstValueInputRef.current?.focus();
      } else {
        onShiftTab?.({
          firstValue: firstInternalValue,
          secondValue: secondInternalValue,
        });
      }
    },
    hotkeyScope,
    [onShiftTab, firstInternalValue, secondInternalValue, focusPosition],
  );

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      onClickOutside?.(event, {
        firstValue: firstInternalValue,
        secondValue: secondInternalValue,
      });
    },
    enabled: isDefined(onClickOutside),
  });

  return (
    <StyledContainer ref={containerRef}>
      <StyledInput
        autoComplete="off"
        autoFocus
        onFocus={() => setFocusPosition('left')}
        ref={firstValueInputRef}
        placeholder={firstValuePlaceholder}
        value={firstInternalValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          handleChange(event.target.value, secondInternalValue);
        }}
      />
      <StyledInput
        autoComplete="off"
        onFocus={() => setFocusPosition('right')}
        ref={secondValueInputRef}
        placeholder={secondValuePlaceholder}
        value={secondInternalValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          handleChange(firstInternalValue, event.target.value);
        }}
      />
    </StyledContainer>
  );
};
