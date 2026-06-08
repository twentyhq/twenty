import { toText } from 'src/logic-functions/utils/to-text';
import { type PhonesValue } from 'src/types/phones-value';
import { isDefined } from 'src/utils/is-defined';

export const buildPhones = (
  candidates: (string | null | undefined)[],
): PhonesValue | undefined => {
  let primaryPhoneNumber: string | undefined;

  for (const candidate of candidates) {
    const phone = toText(candidate);
    if (isDefined(phone)) {
      primaryPhoneNumber = phone;
      break;
    }
  }

  if (!isDefined(primaryPhoneNumber)) {
    return undefined;
  }

  return {
    primaryPhoneNumber,
    primaryPhoneCountryCode: '',
    primaryPhoneCallingCode: '',
    additionalPhones: null,
  };
};
