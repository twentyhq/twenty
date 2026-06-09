import { isNonEmptyArray } from '@sniptt/guards';

import { toText } from 'src/logic-functions/utils/to-text';
import { type PhonesValue } from 'src/types/phones-value';
import { isDefined } from 'src/utils/is-defined';

export const buildPhones = (
  candidates: (string | null | undefined)[],
): PhonesValue | undefined => {
  const numbers: string[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const phone = toText(candidate);
    if (!isDefined(phone) || seen.has(phone)) {
      continue;
    }

    seen.add(phone);
    numbers.push(phone);
  }

  const [primaryPhoneNumber, ...additional] = numbers;
  if (!isDefined(primaryPhoneNumber)) {
    return undefined;
  }

  return {
    primaryPhoneNumber,
    primaryPhoneCountryCode: '',
    primaryPhoneCallingCode: '',
    additionalPhones: isNonEmptyArray(additional)
      ? additional.map((number) => ({
          number,
          countryCode: '',
          callingCode: '',
        }))
      : null,
  };
};
