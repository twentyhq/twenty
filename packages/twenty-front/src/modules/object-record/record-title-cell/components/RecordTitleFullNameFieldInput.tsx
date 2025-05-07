import { useFullNameField } from '@/object-record/record-field/meta-types/hooks/useFullNameField';
import { FIRST_NAME_PLACEHOLDER_WITH_SPECIAL_CHARACTER_TO_AVOID_PASSWORD_MANAGERS } from '@/object-record/record-field/meta-types/input/constants/FirstNamePlaceholder';
import { LAST_NAME_PLACEHOLDER_WITH_SPECIAL_CHARACTER_TO_AVOID_PASSWORD_MANAGERS } from '@/object-record/record-field/meta-types/input/constants/LastNamePlaceholder';
import { isDoubleTextFieldEmpty } from '@/object-record/record-field/meta-types/input/utils/isDoubleTextFieldEmpty';
import { FieldDoubleText } from '@/object-record/record-field/types/FieldDoubleText';
import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '@/object-record/record-field/types/FieldInputEvent';
import { RecordTitleDoubleTextInput } from './RecordTitleDoubleTextInput';

type RecordTitleFullNameFieldInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
  sizeVariant?: 'xs' | 'md';
  hotkeyScope: string;
};

export const RecordTitleFullNameFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
  sizeVariant,
  hotkeyScope,
}: RecordTitleFullNameFieldInputProps) => {
  const { draftValue, setDraftValue, persistFullNameField } =
    useFullNameField();

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
    onEnter?.(() => persistFullNameField(convertToFullName(newDoubleText)));
  };

  const handleEscape = (newDoubleText: FieldDoubleText) => {
    onEscape?.(() => persistFullNameField(convertToFullName(newDoubleText)));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newDoubleText: FieldDoubleText,
  ) => {
    onClickOutside?.(
      () => persistFullNameField(convertToFullName(newDoubleText)),
      event,
    );
  };

  const handleTab = (newDoubleText: FieldDoubleText) => {
    onTab?.(() => persistFullNameField(convertToFullName(newDoubleText)));
  };

  const handleShiftTab = (newDoubleText: FieldDoubleText) => {
    onShiftTab?.(() => persistFullNameField(convertToFullName(newDoubleText)));
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
      hotkeyScope={hotkeyScope}
      onChange={handleChange}
      sizeVariant={sizeVariant}
    />
  );
};
