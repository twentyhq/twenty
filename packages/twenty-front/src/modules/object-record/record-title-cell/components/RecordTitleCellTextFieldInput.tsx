import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useTextField } from '@/object-record/record-field/ui/meta-types/hooks/useTextField';
import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';

import { TextInput } from '@/ui/input/components/TextInput';
import { useContext, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { turnIntoUndefinedIfWhitespacesOnly } from '~/utils/string/turnIntoUndefinedIfWhitespacesOnly';

type RecordTitleCellTextFieldInputProps = {
  instanceId: string;
  sizeVariant?: 'xs' | 'sm' | 'md';
};

export const RecordTitleCellTextFieldInput = ({
  instanceId,
  sizeVariant,
}: RecordTitleCellTextFieldInputProps) => {
  const { fieldDefinition, draftValue, setDraftValue } = useTextField();

  const wrapperRef = useRef<HTMLInputElement>(null);

  const handleChange = (newText: string) => {
    setDraftValue(turnIntoUndefinedIfWhitespacesOnly(newText));
  };

  const { onEnter, onEscape, onClickOutside, onTab, onShiftTab } = useContext(
    FieldInputEventContext,
  );

  useRegisterInputEvents<string>({
    focusId: instanceId,
    inputRef: wrapperRef,
    inputValue: draftValue ?? '',
    onEnter: (inputValue) => {
      onEnter?.({ newValue: inputValue });
    },
    onEscape: (inputValue) => {
      onEscape?.({ newValue: inputValue });
    },
    onClickOutside: (event, inputValue) => {
      onClickOutside?.({ newValue: inputValue, event });
    },
    onTab: (inputValue) => {
      onTab?.({ newValue: inputValue });
    },
    onShiftTab: (inputValue) => {
      onShiftTab?.({ newValue: inputValue });
    },
  });

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (isDefined(draftValue)) {
      event.target.select();
    }
  };

  return (
    <TextInput
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
