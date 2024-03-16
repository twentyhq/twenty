import { useAddressField } from '@/object-record/record-field/meta-types/hooks/useAddressField';
import { FieldDoubleText } from '@/object-record/record-field/types/FieldDoubleText';
import { FieldAddressValue } from '@/object-record/record-field/types/FieldMetadata';
import { DoubleTextInput } from '@/ui/field/input/components/DoubleTextInput';
import { FieldInputOverlay } from '@/ui/field/input/components/FieldInputOverlay';

import { usePersistField } from '../../../hooks/usePersistField';

import { FieldInputEvent } from './DateFieldInput';

const FIRST_NAME_PLACEHOLDER_WITH_SPECIAL_CHARACTER_TO_AVOID_PASSWORD_MANAGERS =
  'F‌‌irst name';

const LAST_NAME_PLACEHOLDER_WITH_SPECIAL_CHARACTER_TO_AVOID_PASSWORD_MANAGERS =
  'L‌‌ast name';

export type AddressFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const AddressFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: AddressFieldInputProps) => {
  const { hotkeyScope, draftValue, setDraftValue } = useAddressField();

  const persistField = usePersistField();

  const convertToAddress = (
    newDoubleText: FieldDoubleText,
  ): FieldAddressValue => {
    return {
      addressStreet1: newDoubleText.firstValue,
      addressStreet2: newDoubleText.secondValue,
      addressCity: null,
      addressState: null,
      addressCountry: null,
      addressPostcode: null,
      addressLat: null,
      addressLng: null,
    };
  };

  const handleEnter = (newDoubleText: FieldDoubleText) => {
    onEnter?.(() => persistField(convertToAddress(newDoubleText)));
  };

  const handleEscape = (newDoubleText: FieldDoubleText) => {
    onEscape?.(() => persistField(convertToAddress(newDoubleText)));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newDoubleText: FieldDoubleText,
  ) => {
    onClickOutside?.(() => persistField(convertToAddress(newDoubleText)));
  };

  const handleTab = (newDoubleText: FieldDoubleText) => {
    onTab?.(() => persistField(convertToAddress(newDoubleText)));
  };

  const handleShiftTab = (newDoubleText: FieldDoubleText) => {
    onShiftTab?.(() => persistField(convertToAddress(newDoubleText)));
  };

  const handleChange = (newDoubleText: FieldDoubleText) => {
    setDraftValue(convertToAddress(newDoubleText));
  };

  return (
    <FieldInputOverlay>
      <DoubleTextInput
        firstValue={draftValue?.addressStreet1 ?? ''}
        secondValue={draftValue?.addressStreet2 ?? ''}
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
        hotkeyScope={hotkeyScope}
        onChange={handleChange}
      />
    </FieldInputOverlay>
  );
};
