import { type PhoneRecord } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

export const normalizeAdditionalPhones = (
  additionalPhones: unknown,
): PhoneRecord[] => {
  if (!Array.isArray(additionalPhones)) {
    return [];
  }

  return additionalPhones
    .map((additionalPhone): PhoneRecord | null => {
      if (!isPlainObject(additionalPhone)) {
        return null;
      }

      const { number, callingCode, countryCode } =
        additionalPhone as Partial<PhoneRecord>;

      if (!isNonEmptyString(number)) {
        return null;
      }

      return {
        number,
        callingCode: callingCode ?? '',
        countryCode: countryCode ?? '',
      };
    })
    .filter(isDefined);
};
