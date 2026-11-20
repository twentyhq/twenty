import parsePhoneNumber from 'libphonenumber-js/max';
import { isDefined } from 'twenty-sdk/utils';

// WhatsApp sends numbers in international format without the leading +
export const parseWhatsappPhoneNumber = (phoneNumber: string) => {
  const parsedPhoneNumber = parsePhoneNumber(
    phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`,
  );

  if (!isDefined(parsedPhoneNumber)) {
    return undefined;
  }

  return {
    primaryPhoneNumber: parsedPhoneNumber.nationalNumber,
    primaryPhoneCallingCode: `+${parsedPhoneNumber.countryCallingCode}`,
    primaryPhoneCountryCode: parsedPhoneNumber.country,
  };
};
