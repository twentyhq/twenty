import { parsePhoneNumber, PhoneNumber } from 'libphonenumber-js';
import { MouseEvent } from 'react';
import { ContactLink } from 'twenty-ui';

import { isDefined } from '~/utils/isDefined';

interface PhoneDisplayProps {
  value: PhoneDisplayValueProps;
}
type PhoneDisplayValueProps = {
  number: string | null | undefined;
  callingCode: string | null | undefined;
};

// TODO: see if we can find a faster way to format the phone number
export const PhoneDisplay = ({
  value: { number, callingCode },
}: PhoneDisplayProps) => {
  // console.log('PhoneDisplay: number, callingCode', number, callingCode);
  if (!isDefined(number)) return <ContactLink href="#">{number}</ContactLink>;

  const callingCodeSanitized = callingCode?.replace('+', '');

  let parsedPhoneNumber: PhoneNumber | null = null;

  try {
    parsedPhoneNumber = parsePhoneNumber(number, {
      defaultCallingCode: callingCodeSanitized || '1',
    });
  } catch (error) {
    if (!(error instanceof Error))
      return <ContactLink href="#">{number}</ContactLink>;
    if (error.message === 'NOT_A_NUMBER')
      return <ContactLink href="#">{`+${callingCodeSanitized}`}</ContactLink>;
    return <ContactLink href="#">{number}</ContactLink>;
  }

  const URI = parsedPhoneNumber.getURI();
  const formatedPhoneNumber = parsedPhoneNumber.formatInternational();
  // todo
  // console.log('PhoneDisplay: formatedPhoneNumber', formatedPhoneNumber);
  return (
    <ContactLink
      href={URI}
      onClick={(event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
      }}
    >
      {formatedPhoneNumber || number}
    </ContactLink>
  );
};
