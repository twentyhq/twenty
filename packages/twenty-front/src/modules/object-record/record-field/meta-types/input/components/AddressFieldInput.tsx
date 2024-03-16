import { useAddressField } from '@/object-record/record-field/meta-types/hooks/useAddressField';
import { FieldAddressDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { FieldAddressValue } from '@/object-record/record-field/types/FieldMetadata';
import { AddressInput } from '@/ui/field/input/components/AddressInput';
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
    newAddress: FieldAddressDraftValue,
  ): FieldAddressValue => {
    return {
      addressStreet1: newAddress.addressStreet1,
      addressStreet2: newAddress.addressStreet2,
      addressCity: null,
      addressState: null,
      addressCountry: null,
      addressPostcode: null,
      addressLat: null,
      addressLng: null,
    };
  };

  const handleEnter = (newAddress: FieldAddressDraftValue) => {
    onEnter?.(() => persistField(convertToAddress(newAddress)));
  };

  const handleEscape = (newAddress: FieldAddressDraftValue) => {
    onEscape?.(() => persistField(convertToAddress(newAddress)));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newAddress: FieldAddressDraftValue,
  ) => {
    onClickOutside?.(() => persistField(convertToAddress(newAddress)));
  };

  const handleTab = (newAddress: FieldAddressDraftValue) => {
    onTab?.(() => persistField(convertToAddress(newAddress)));
  };

  const handleShiftTab = (newAddress: FieldAddressDraftValue) => {
    onShiftTab?.(() => persistField(convertToAddress(newAddress)));
  };

  const handleChange = (newAddress: FieldAddressDraftValue) => {
    setDraftValue(convertToAddress(newAddress));
  };

  return (
    <FieldInputOverlay>
      <AddressInput
        value={draftValue}
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
