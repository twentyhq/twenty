import { useFullNameField } from '@/object-record/record-field/meta-types/hooks/useFullNameField';
import { FieldDoubleText } from '@/object-record/record-field/types/FieldDoubleText';
import { DoubleTextInput } from '@/ui/field/input/components/DoubleTextInput';
import { FieldInputOverlay } from '@/ui/field/input/components/FieldInputOverlay';

import { usePersistField } from '../../../hooks/usePersistField';

import { FieldInputEvent } from './DateTimeFieldInput';

const FIRST_NAME_PLACEHOLDER_WITH_SPECIAL_CHARACTER_TO_AVOID_PASSWORD_MANAGERS =
  'F‌‌irst name';

const LAST_NAME_PLACEHOLDER_WITH_SPECIAL_CHARACTER_TO_AVOID_PASSWORD_MANAGERS =
  'L‌‌ast name';

type FullNameFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const FullNameFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: FullNameFieldInputProps) => {
  const { hotkeyScope, draftValue, setDraftValue } = useFullNameField();

  const persistField = usePersistField();

  const isTrimmedFieldDoubleTextEmpty = (newDoubleText: FieldDoubleText) => {
    const { firstValue, secondValue } = newDoubleText;
    const totalLength = firstValue.trim().length + secondValue.trim().length;
    return totalLength ? false : true;
  };

  const convertToFullName = (newDoubleText: FieldDoubleText) => {
    return {
      firstName: newDoubleText.firstValue.trim(),
      lastName: newDoubleText.secondValue.trim(),
    };
  };

  const getRequiredValuetoPersistFromDoubleText = (
    newDoubleText: FieldDoubleText,
  ) => {
    return isTrimmedFieldDoubleTextEmpty(newDoubleText)
      ? undefined
      : convertToFullName(newDoubleText);
  };

  const handleEnter = (newDoubleText: FieldDoubleText) => {
    onEnter?.(() =>
      persistField(getRequiredValuetoPersistFromDoubleText(newDoubleText)),
    );
  };

  const handleEscape = (newDoubleText: FieldDoubleText) => {
    onEscape?.(() =>
      persistField(getRequiredValuetoPersistFromDoubleText(newDoubleText)),
    );
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newDoubleText: FieldDoubleText,
  ) => {
    onClickOutside?.(() =>
      persistField(getRequiredValuetoPersistFromDoubleText(newDoubleText)),
    );
  };

  const handleTab = (newDoubleText: FieldDoubleText) => {
    onTab?.(
      () => () =>
        persistField(getRequiredValuetoPersistFromDoubleText(newDoubleText)),
    );
  };

  const handleShiftTab = (newDoubleText: FieldDoubleText) => {
    onShiftTab?.(
      () => () =>
        persistField(getRequiredValuetoPersistFromDoubleText(newDoubleText)),
    );
  };

  const handleChange = (newDoubleText: FieldDoubleText) => {
    setDraftValue(getRequiredValuetoPersistFromDoubleText(newDoubleText));
  };

  const handlePaste = (newDoubleText: FieldDoubleText) => {
    setDraftValue(getRequiredValuetoPersistFromDoubleText(newDoubleText));
  };

  return (
    <FieldInputOverlay>
      <DoubleTextInput
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
      />
    </FieldInputOverlay>
  );
};
