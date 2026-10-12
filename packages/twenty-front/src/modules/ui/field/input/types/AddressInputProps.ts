import { type FieldAddressDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { type FieldAddressValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type AllowedAddressSubField } from 'twenty-shared/types';

export type AddressInputProps = {
  instanceId: string;
  value: FieldAddressValue;
  onTab: (newAddress: FieldAddressDraftValue) => void;
  onShiftTab: (newAddress: FieldAddressDraftValue) => void;
  onEnter: (newAddress: FieldAddressDraftValue) => void;
  onEscape: (newAddress: FieldAddressDraftValue) => void;
  onClickOutside: (args: {
    event: MouseEvent | TouchEvent;
    newAddress: FieldAddressDraftValue;
  }) => void;
  clearable?: boolean;
  onChange?: (updatedValue: FieldAddressDraftValue) => void;
  subFields?: AllowedAddressSubField[] | null;
};
