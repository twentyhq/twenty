import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useTextField } from '@/object-record/record-field/meta-types/hooks/useTextField';
import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '@/object-record/record-field/types/FieldInputEvent';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { turnIntoUndefinedIfWhitespacesOnly } from '~/utils/string/turnIntoUndefinedIfWhitespacesOnly';

type RecordTitleCellTextFieldInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
  sizeVariant?: 'xs' | 'md';
  hotkeyScope: string;
};

export const RecordTitleCellTextFieldInput = ({
  sizeVariant,
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
  hotkeyScope,
}: RecordTitleCellTextFieldInputProps) => {
  const { fieldDefinition, draftValue, setDraftValue } = useTextField();

  const wrapperRef = useRef<HTMLInputElement>(null);

  const handleChange = (newText: string) => {
    setDraftValue(turnIntoUndefinedIfWhitespacesOnly(newText));
  };

  const persistField = usePersistField();

  useRegisterInputEvents<string>({
    inputRef: wrapperRef,
    inputValue: draftValue ?? '',
    onEnter: (inputValue) => {
      onEnter?.(() => persistField(inputValue));
    },
    onEscape: (inputValue) => {
      onEscape?.(() => persistField(inputValue));
    },
    onClickOutside: (event, inputValue) => {
      onClickOutside?.(() => persistField(inputValue), event);
    },
    onTab: (inputValue) => {
      onTab?.(() => persistField(inputValue));
    },
    onShiftTab: (inputValue) => {
      onShiftTab?.(() => persistField(inputValue));
    },
    hotkeyScope,
  });

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (isDefined(draftValue)) {
      event.target.select();
    }
  };

  return (
    <TextInputV2
      ref={wrapperRef}
      autoGrow
      sizeVariant={sizeVariant}
      inheritFontStyles
      value={draftValue ?? ''}
      onChange={handleChange}
      placeholder={fieldDefinition.label}
      onFocus={handleFocus}
      autoFocus
    />
  );
};
