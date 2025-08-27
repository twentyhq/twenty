import styled from '@emotion/styled';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
} from 'react';
import { Key } from 'ts-key-enum';

import { type FieldDoubleText } from '@/object-record/record-field/ui/types/FieldDoubleText';

import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from 'twenty-shared/utils';
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
  instanceId: string;
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
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
  instanceId,
  firstValue,
  secondValue,
  firstValuePlaceholder,
  secondValuePlaceholder,
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

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: () => {
      onEnter({
        firstValue: firstInternalValue,
        secondValue: secondInternalValue,
      });
    },
    focusId: instanceId,
    dependencies: [onEnter, firstInternalValue, secondInternalValue],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      onEscape({
        firstValue: firstInternalValue,
        secondValue: secondInternalValue,
      });
    },
    focusId: instanceId,
    dependencies: [onEscape, firstInternalValue, secondInternalValue],
  });

  useHotkeysOnFocusedElement({
    keys: ['tab'],
    callback: () => {
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
    focusId: instanceId,
    dependencies: [
      onTab,
      firstInternalValue,
      secondInternalValue,
      focusPosition,
    ],
  });

  useHotkeysOnFocusedElement({
    keys: ['shift+tab'],
    callback: () => {
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
    focusId: instanceId,
    dependencies: [
      onShiftTab,
      firstInternalValue,
      secondInternalValue,
      focusPosition,
    ],
  });

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
