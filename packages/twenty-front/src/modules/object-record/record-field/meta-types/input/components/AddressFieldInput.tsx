import { useAddressField } from '@/object-record/record-field/meta-types/hooks/useAddressField';
import { FieldAddressDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { AddressInput } from '@/ui/field/input/components/AddressInput';

import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '@/object-record/record-field/types/FieldInputEvent';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { usePersistField } from '../../../hooks/usePersistField';

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
  const { draftValue, setDraftValue, fieldDefinition } = useAddressField();

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
  const settings = fieldDefinition.metadata.settings;

  const subFields =
    settings && 'subFields' in settings ? settings.subFields : undefined;
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

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  return (
    <AddressInput
      instanceId={instanceId}
      value={convertToAddress(draftValue)}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onChange={handleChange}
      onTab={handleTab}
      onShiftTab={handleShiftTab}
      subFields={subFields}
    />
  );
};
