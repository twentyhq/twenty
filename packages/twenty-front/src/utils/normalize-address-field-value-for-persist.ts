import { isNonEmptyString } from '@sniptt/guards';

import { type FieldAddressValue } from '@/object-record/record-field/ui/types/FieldMetadata';

// When every user-editable text part of the address is empty, clear coordinates
// so DB columns for addressLat/addressLng are updated (see formatCompositeField
// in twenty-server: omitted keys are not written, leaving old coordinates in place).
export const normalizeAddressFieldValueForPersist = (
  address: FieldAddressValue,
): FieldAddressValue => {
  const allTextPartsEmpty =
    !isNonEmptyString(address.addressStreet1) &&
    !isNonEmptyString(address.addressStreet2) &&
    !isNonEmptyString(address.addressCity) &&
    !isNonEmptyString(address.addressState) &&
    !isNonEmptyString(address.addressPostcode) &&
    !isNonEmptyString(address.addressCountry);

  if (!allTextPartsEmpty) {
    return address;
  }

  return {
    ...address,
    addressLat: null,
    addressLng: null,
  };
};
