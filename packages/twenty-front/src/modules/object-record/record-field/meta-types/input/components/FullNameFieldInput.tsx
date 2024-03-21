import { useFullNameField } from '@/object-record/record-field/meta-types/hooks/useFullNameField';
import { FieldDoubleText } from '@/object-record/record-field/types/FieldDoubleText';
import { DoubleTextInput } from '@/ui/field/input/components/DoubleTextInput';
import { FieldInputOverlay } from '@/ui/field/input/components/FieldInputOverlay';

import { usePersistField } from '../../../hooks/usePersistField';

import { FieldInputEvent } from './DateFieldInput';

const FIRST_NAME_PLACEHOLDER_WITH_SPECIAL_CHARACTER_TO_AVOID_PASSWORD_MANAGERS =
  'F‌‌irst name';

const LAST_NAME_PLACEHOLDER_WITH_SPECIAL_CHARACTER_TO_AVOID_PASSWORD_MANAGERS =
  'L‌‌ast name';

export type FullNameFieldInputProps = {
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

  const convertToFullName = (newDoubleText: FieldDoubleText) => {
    return {
      firstName: newDoubleText.firstValue,
      lastName: newDoubleText.secondValue,
    };
  };

  const handleEnter = (newDoubleText: FieldDoubleText) => {
    onEnter?.(() => persistField(convertToFullName(newDoubleText)));
  };

  const handleEscape = (newDoubleText: FieldDoubleText) => {
    onEscape?.(() => persistField(convertToFullName(newDoubleText)));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newDoubleText: FieldDoubleText,
  ) => {
    onClickOutside?.(() => persistField(convertToFullName(newDoubleText)));
  };

  const handleTab = (newDoubleText: FieldDoubleText) => {
    onTab?.(() => persistField(convertToFullName(newDoubleText)));
  };

  const handleShiftTab = (newDoubleText: FieldDoubleText) => {
    onShiftTab?.(() => persistField(convertToFullName(newDoubleText)));
  };

  const handleChange = (newDoubleText: FieldDoubleText) => {
    setDraftValue(convertToFullName(newDoubleText));
  };

  const handlePaste = (newDoubleText: FieldDoubleText) => {
    setDraftValue(convertToFullName(newDoubleText));
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
