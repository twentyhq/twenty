import { useAddressField } from '@/object-record/record-field/ui/meta-types/hooks/useAddressField';
import { type FieldAddressDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { AddressInput } from '@/ui/field/input/components/AddressInput';

import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext } from 'react';

export const AddressFieldInput = () => {
  const { draftValue, setDraftValue, fieldDefinition } = useAddressField();

  const { onEnter, onTab, onShiftTab, onEscape, onClickOutside } = useContext(
    FieldInputEventContext,
  );

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
    onEnter?.({ newValue: convertToAddress(newAddress) });
  };

  const handleTab = (newAddress: FieldAddressDraftValue) => {
    onTab?.({ newValue: convertToAddress(newAddress) });
  };

  const handleShiftTab = (newAddress: FieldAddressDraftValue) => {
    onShiftTab?.({ newValue: convertToAddress(newAddress) });
  };

  const handleEscape = (newAddress: FieldAddressDraftValue) => {
    onEscape?.({ newValue: convertToAddress(newAddress) });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newAddress: FieldAddressDraftValue,
  ) => {
    onClickOutside?.({ newValue: convertToAddress(newAddress), event });
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
