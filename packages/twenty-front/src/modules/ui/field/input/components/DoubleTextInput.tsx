import styled from '@emotion/styled';
import {
  ChangeEvent,
  ClipboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Key } from 'ts-key-enum';

import { FieldDoubleText } from '@/object-record/record-field/types/FieldDoubleText';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isDefined } from '~/utils/isDefined';

import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { splitFullName } from '~/utils/format/spiltFullName';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';
import { StyledTextInput } from './TextInput';

const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;

  & > input:last-child {
    border-left: 1px solid ${({ theme }) => theme.border.color.strong};
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
  onChange?: (newDoubleTextValue: FieldDoubleText) => void;
  onPaste?: (newDoubleTextValue: FieldDoubleText) => void;
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
  onChange,
  onPaste,
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

    onChange?.({
      firstValue: newFirstValue,
      secondValue: newSecondValue,
    });
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
    [Key.Escape],
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
    listenerId: 'double-text-input',
  });

  const handleOnPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (firstInternalValue.length > 0 || secondInternalValue.length > 0) {
      return;
    }

    event.preventDefault();

    const name = event.clipboardData.getData('Text');

    const splittedName = splitFullName(name);

    onPaste?.({
      firstValue: splittedName[0],
      secondValue: splittedName[1],
    });
  };

  const handleClickToPreventParentClickEvents = (
    event: React.MouseEvent<HTMLInputElement>,
  ) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <FieldInputContainer>
      <StyledContainer ref={containerRef}>
        <StyledTextInput
          autoComplete="off"
          autoFocus
          onFocus={() => setFocusPosition('left')}
          ref={firstValueInputRef}
          placeholder={firstValuePlaceholder}
          value={firstInternalValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleChange(
              turnIntoEmptyStringIfWhitespacesOnly(event.target.value),
              secondInternalValue,
            );
          }}
          onPaste={(event: ClipboardEvent<HTMLInputElement>) =>
            handleOnPaste(event)
          }
          onClick={handleClickToPreventParentClickEvents}
        />
        <StyledTextInput
          autoComplete="off"
          onFocus={() => setFocusPosition('right')}
          ref={secondValueInputRef}
          placeholder={secondValuePlaceholder}
          value={secondInternalValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleChange(
              firstInternalValue,
              turnIntoEmptyStringIfWhitespacesOnly(event.target.value),
            );
          }}
          onClick={handleClickToPreventParentClickEvents}
        />
      </StyledContainer>
    </FieldInputContainer>
  );
};
