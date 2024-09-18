import { parsePhoneNumber, PhoneNumber } from 'libphonenumber-js';
import { MouseEvent } from 'react';

import { ContactLink } from '@/ui/navigation/link/components/ContactLink';
import { isDefined } from '~/utils/isDefined';

type PhoneDisplayProps = {
  value: string | null | undefined;
};

// TODO: see if we can find a faster way to format the phone number
export const PhoneDisplay = ({ value }: PhoneDisplayProps) => {
  if (!isDefined(value)) {
    return <ContactLink href="#">{value}</ContactLink>;
  }

  let parsedPhoneNumber: PhoneNumber | null = null;

  try {
    // TODO: parse according to locale not hard coded FR
    parsedPhoneNumber = parsePhoneNumber(value, 'FR');
  } catch (error) {
    return <ContactLink href="#">{value}</ContactLink>;
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
      {formatedPhoneNumber || value}
    </ContactLink>
  );
};
