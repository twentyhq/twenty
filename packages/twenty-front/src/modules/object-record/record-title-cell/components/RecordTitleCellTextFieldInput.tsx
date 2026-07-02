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

  // When the title cell is in edit mode but the user never typed anything, the
  // draft is undefined. Persisting then writes an empty string over the existing
  // label identifier — e.g. opening another field counts as a click-outside and
  // blanks the record's name. Skip persisting an untouched title.
  const isTitleUntouched = !isDefined(draftValue);

  useRegisterInputEvents<string>({
    focusId: instanceId,
    inputRef: wrapperRef,
    inputValue: draftValue ?? '',
    onEnter: (inputValue) => {
      onEnter?.({ newValue: inputValue, skipPersist: isTitleUntouched });
    },
    onEscape: (inputValue) => {
      onEscape?.({ newValue: inputValue });
    },
    onClickOutside: (event, inputValue) => {
      onClickOutside?.({
        newValue: inputValue,
        event,
        skipPersist: isTitleUntouched,
      });
    },
    onTab: (inputValue) => {
      onTab?.({ newValue: inputValue, skipPersist: isTitleUntouched });
    },
    onShiftTab: (inputValue) => {
      onShiftTab?.({ newValue: inputValue, skipPersist: isTitleUntouched });
    },
  });

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    // Ensure draft value is set from field value if it's undefined or empty when focusing
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
