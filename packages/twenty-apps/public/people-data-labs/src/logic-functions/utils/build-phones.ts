import { isNonEmptyArray } from '@sniptt/guards';

import { toText } from 'src/logic-functions/utils/to-text';
import { type PhonesValue } from 'src/types/phones-value';
import { isDefined } from 'src/utils/is-defined';

export const buildPhones = (
  phoneCandidates: (string | null | undefined)[],
): PhonesValue | undefined => {
  const uniquePhoneNumbers: string[] = [];
  const seenPhoneNumbers = new Set<string>();

  for (const candidate of phoneCandidates) {
    const phoneNumber = toText(candidate);
    if (!isDefined(phoneNumber) || seenPhoneNumbers.has(phoneNumber)) {
      continue;
    }

    seenPhoneNumbers.add(phoneNumber);
    uniquePhoneNumbers.push(phoneNumber);
  }

  const [primaryPhoneNumber, ...additionalPhoneNumbers] = uniquePhoneNumbers;
  if (!isDefined(primaryPhoneNumber)) {
    return undefined;
  }

  return {
    primaryPhoneNumber,
    primaryPhoneCountryCode: '',
    primaryPhoneCallingCode: '',
    additionalPhones: isNonEmptyArray(additionalPhoneNumbers)
      ? additionalPhoneNumbers.map((phoneNumber) => ({
          number: phoneNumber,
          countryCode: '',
          callingCode: '',
        }))
      : null,
  };
};
