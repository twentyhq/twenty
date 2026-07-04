import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useFullNameField } from '@/object-record/record-field/ui/meta-types/hooks/useFullNameField';
import { FIRST_NAME_PLACEHOLDER_WITH_SPECIAL_CHARACTER_TO_AVOID_PASSWORD_MANAGERS } from '@/object-record/record-field/ui/meta-types/input/constants/FirstNamePlaceholder';
import { LAST_NAME_PLACEHOLDER_WITH_SPECIAL_CHARACTER_TO_AVOID_PASSWORD_MANAGERS } from '@/object-record/record-field/ui/meta-types/input/constants/LastNamePlaceholder';
import { isDoubleTextFieldEmpty } from '@/object-record/record-field/ui/meta-types/input/utils/isDoubleTextFieldEmpty';
import { type FieldDoubleText } from '@/object-record/record-field/ui/types/FieldDoubleText';

import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { RecordTitleDoubleTextInput } from './RecordTitleDoubleTextInput';

type RecordTitleFullNameFieldInputProps = {
  sizeVariant?: 'xs' | 'sm' | 'md';
};

export const RecordTitleFullNameFieldInput = ({
  sizeVariant,
}: RecordTitleFullNameFieldInputProps) => {
  const { draftValue, setDraftValue } = useFullNameField();

  const { onEnter, onEscape, onClickOutside, onTab, onShiftTab } = useContext(
    FieldInputEventContext,
  );

  // An untouched title has an undefined draft; persisting it would blank the existing label identifier (e.g. on click-outside), so skip persist.
  const isTitleUntouched = !isDefined(draftValue);

  const convertToFullName = (newDoubleText: FieldDoubleText) => {
    return {
      firstName: newDoubleText.firstValue.trim(),
      lastName: newDoubleText.secondValue.trim(),
    };
  };

  const getRequiredDraftValueFromDoubleText = (
    newDoubleText: FieldDoubleText,
  ) => {
    return isDoubleTextFieldEmpty(newDoubleText)
      ? undefined
      : convertToFullName(newDoubleText);
  };

  const handleEnter = (newDoubleText: FieldDoubleText) => {
    onEnter?.({
      newValue: convertToFullName(newDoubleText),
      skipPersist: isTitleUntouched,
    });
  };

  const handleEscape = (newDoubleText: FieldDoubleText) => {
    onEscape?.({ newValue: convertToFullName(newDoubleText) });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newDoubleText: FieldDoubleText,
  ) => {
    onClickOutside?.({
      newValue: convertToFullName(newDoubleText),
      event,
      skipPersist: isTitleUntouched,
    });
  };

  const handleTab = (newDoubleText: FieldDoubleText) => {
    onTab?.({
      newValue: convertToFullName(newDoubleText),
      skipPersist: isTitleUntouched,
    });
  };

  const handleShiftTab = (newDoubleText: FieldDoubleText) => {
    onShiftTab?.({
      newValue: convertToFullName(newDoubleText),
      skipPersist: isTitleUntouched,
    });
  };

  const handleChange = (newDoubleText: FieldDoubleText) => {
    setDraftValue(getRequiredDraftValueFromDoubleText(newDoubleText));
  };

  const handlePaste = (newDoubleText: FieldDoubleText) => {
    setDraftValue(getRequiredDraftValueFromDoubleText(newDoubleText));
  };

  return (
    <RecordTitleDoubleTextInput
      firstValue={draftValue?.firstName ?? ''}
      secondValue={draftValue?.lastName ?? ''}
      firstValuePlaceholder={
        FIRST_NAME_PLACEHOLDER_WITH_SPECIAL_CHARACTER_TO_AVOID_PASSWORD_MANAGERS
      }
      secondValuePlaceholder={
        LAST_NAME_PLACEHOLDER_WITH_SPECIAL_CHARACTER_TO_AVOID_PASSWORD_MANAGERS
      }
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onShiftTab={handleShiftTab}
      onTab={handleTab}
      onPaste={handlePaste}
      onChange={handleChange}
      sizeVariant={sizeVariant}
    />
  );
};
