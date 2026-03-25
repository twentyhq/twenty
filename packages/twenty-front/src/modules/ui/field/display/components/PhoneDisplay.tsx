import { parsePhoneNumber, type PhoneNumber } from 'libphonenumber-js';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ContactLink } from 'twenty-ui/navigation';

interface PhoneDisplayProps {
  value: PhoneDisplayValueProps;
}
type PhoneDisplayValueProps = {
  number: string | null | undefined;
  callingCode: string | null | undefined;
};

export const PhoneDisplay = ({
  value: { number, callingCode },
}: PhoneDisplayProps) => {
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
