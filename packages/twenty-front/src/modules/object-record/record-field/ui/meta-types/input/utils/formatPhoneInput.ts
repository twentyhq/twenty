import { type PhoneRecord } from '@/object-record/record-field/ui/types/FieldMetadata';
import { parsePhoneNumber } from 'libphonenumber-js';
import { isDefined } from 'twenty-shared/utils';

const EMPTY_PHONE: PhoneRecord = {
  number: '',
  callingCode: '',
  countryCode: '',
};

export const formatPhoneInput = ({ input }: { input: string }): PhoneRecord => {
  if (input === '') {
    return EMPTY_PHONE;
  }

  const phone = parsePhoneNumber(input);

  if (!isDefined(phone)) {
    return EMPTY_PHONE;
  }

  return {
    number: phone.nationalNumber,
    callingCode: `+${phone.countryCallingCode}`,
    countryCode: phone.country ?? '',
  };
};
