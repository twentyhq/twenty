import { useAddressField } from '@/object-record/record-field/meta-types/hooks/useAddressField';
import { FieldAddressDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { AddressInput } from '@/ui/field/input/components/AddressInput';

import { usePersistField } from '../../../hooks/usePersistField';

import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from './DateTimeFieldInput';

export type AddressFieldInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
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
    newAddress: FieldAddressDraftValue | undefined,
  ): FieldAddressDraftValue => {
    return {
      addressStreet1: newAddress?.addressStreet1 ?? '',
      addressStreet2: newAddress?.addressStreet2 ?? null,
      addressCity: newAddress?.addressCity ?? null,
      addressState: newAddress?.addressState ?? null,
      addressCountry: newAddress?.addressCountry ?? null,
      addressPostcode: newAddress?.addressPostcode ?? null,
      addressLat: newAddress?.addressLat ?? null,
      addressLng: newAddress?.addressLng ?? null,
    };
  };

  const handleEnter = (newAddress: FieldAddressDraftValue) => {
    onEnter?.(() => persistField(convertToAddress(newAddress)));
  };

  const handleTab = (newAddress: FieldAddressDraftValue) => {
    onTab?.(() => persistField(convertToAddress(newAddress)));
  };

  const handleShiftTab = (newAddress: FieldAddressDraftValue) => {
    onShiftTab?.(() => persistField(convertToAddress(newAddress)));
  };

  const handleEscape = (newAddress: FieldAddressDraftValue) => {
    onEscape?.(() => persistField(convertToAddress(newAddress)));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newAddress: FieldAddressDraftValue,
  ) => {
    onClickOutside?.(() => persistField(convertToAddress(newAddress)), event);
  };

  const handleChange = (newAddress: FieldAddressDraftValue) => {
    setDraftValue(convertToAddress(newAddress));
  };

  return (
    <AddressInput
      value={convertToAddress(draftValue)}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      hotkeyScope={hotkeyScope}
      onChange={handleChange}
      onTab={handleTab}
      onShiftTab={handleShiftTab}
    />
  );
};
