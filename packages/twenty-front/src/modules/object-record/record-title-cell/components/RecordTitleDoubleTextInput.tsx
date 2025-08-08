import styled from '@emotion/styled';
import { ClipboardEvent, useEffect, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';

import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { FieldDoubleText } from '@/object-record/record-field/types/FieldDoubleText';
import { TextInput } from '@/ui/input/components/TextInput';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { isDefined } from 'twenty-shared/utils';
import { splitFullName } from '~/utils/format/spiltFullName';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: inherit;
  width: 100%;
`;

const StyledTextInputWrapper = styled.div`
  max-width: 50%;
`;

type RecordTitleDoubleTextInputProps = {
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
  sizeVariant?: 'xs' | 'md';
};

export const RecordTitleDoubleTextInput = ({
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
  sizeVariant,
}: RecordTitleDoubleTextInputProps) => {
  const [firstInternalValue, setFirstInternalValue] = useState(firstValue);
  const [secondInternalValue, setSecondInternalValue] = useState(secondValue);

  const firstValueInputRef = useRef<HTMLInputElement>(null);
  const secondValueInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

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
    listenerId: 'record-title-double-text-input',
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
    <StyledContainer ref={containerRef}>
      <StyledTextInputWrapper>
        <TextInput
          autoGrow
          sizeVariant={sizeVariant}
          autoComplete="off"
          inheritFontStyles
          autoFocus
          onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
            if (isDefined(firstInternalValue)) {
              event.target.select();
            }
            setFocusPosition('left');
          }}
          ref={firstValueInputRef}
          placeholder={firstValuePlaceholder}
          value={firstInternalValue}
          onChange={(text: string) => {
            handleChange(
              turnIntoEmptyStringIfWhitespacesOnly(text),
              secondInternalValue,
            );
          }}
          onPaste={(event: ClipboardEvent<HTMLInputElement>) =>
            handleOnPaste(event)
          }
          onClick={handleClickToPreventParentClickEvents}
        />
      </StyledTextInputWrapper>
      <StyledTextInputWrapper>
        <TextInput
          autoGrow
          sizeVariant={sizeVariant}
          autoComplete="off"
          inheritFontStyles
          onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
            if (isDefined(secondInternalValue)) {
              event.target.select();
            }
            setFocusPosition('right');
          }}
          ref={secondValueInputRef}
          placeholder={secondValuePlaceholder}
          value={secondInternalValue}
          onChange={(text: string) => {
            handleChange(
              firstInternalValue,
              turnIntoEmptyStringIfWhitespacesOnly(text),
            );
          }}
          onClick={handleClickToPreventParentClickEvents}
        />
      </StyledTextInputWrapper>
    </StyledContainer>
  );
};
