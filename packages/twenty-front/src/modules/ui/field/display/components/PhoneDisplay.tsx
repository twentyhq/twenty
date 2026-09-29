import { ContactLink } from '@/ui/field/display/components/internal/ContactLink/ContactLink';
import { parsePhoneNumber, type PhoneNumber } from 'libphonenumber-js';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';

interface PhoneDisplayProps {
  value: PhoneDisplayValueProps;
}
type PhoneDisplayValueProps = {
  number: string | null | undefined;
  callingCode: string | null | undefined;
};

// Phone numbers read left to right in every locale; without an explicit
// direction, an RTL page reorders their digit groups.
export const PhoneDisplay = ({
  value: { number, callingCode },
}: PhoneDisplayProps) => {
  if (!isDefined(number))
    return (
      <ContactLink href="#" dir="ltr">
        {number}
      </ContactLink>
    );

  const callingCodeSanitized = callingCode?.replace('+', '');

  let parsedPhoneNumber: PhoneNumber | null = null;

  try {
    parsedPhoneNumber = parsePhoneNumber(number, {
      defaultCallingCode: callingCodeSanitized || '1',
    });
  } catch (error) {
    if (!(error instanceof Error))
      return (
        <ContactLink href="#" dir="ltr">
          {number}
        </ContactLink>
      );
    if (error.message === 'NOT_A_NUMBER')
      return (
        <ContactLink
          href="#"
          dir="ltr"
        >{`+${callingCodeSanitized}`}</ContactLink>
      );
    return (
      <ContactLink href="#" dir="ltr">
        {number}
      </ContactLink>
    );
  }

  const URI = parsedPhoneNumber.getURI();
  const formatedPhoneNumber = parsedPhoneNumber.formatInternational();
  return (
    <ContactLink
      href={URI}
      dir="ltr"
      onClick={(event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
      }}
    >
      {formatedPhoneNumber || number}
    </ContactLink>
  );
};
