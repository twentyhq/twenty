import { isUndefined } from '@sniptt/guards';

import { type FieldAddressDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';

export const keepAddressFieldsEditedDuringAutofill = ({
  autofilledAddress,
  addressAtSelection,
  currentAddress,
}: {
  autofilledAddress: FieldAddressDraftValue;
  addressAtSelection: FieldAddressDraftValue | undefined;
  currentAddress: FieldAddressDraftValue | undefined;
}): FieldAddressDraftValue => {
  const pickField = <TField extends keyof FieldAddressDraftValue>(
    field: TField,
  ): FieldAddressDraftValue[TField] => {
    const currentFieldValue = currentAddress?.[field];
    const isEditedDuringAutofill =
      currentFieldValue !== addressAtSelection?.[field];

    return isEditedDuringAutofill && !isUndefined(currentFieldValue)
      ? currentFieldValue
      : autofilledAddress[field];
  };

  return {
    addressStreet1: pickField('addressStreet1'),
    addressStreet2: pickField('addressStreet2'),
    addressCity: pickField('addressCity'),
    addressState: pickField('addressState'),
    addressPostcode: pickField('addressPostcode'),
    addressCountry: pickField('addressCountry'),
    addressLat: pickField('addressLat'),
    addressLng: pickField('addressLng'),
  };
};
