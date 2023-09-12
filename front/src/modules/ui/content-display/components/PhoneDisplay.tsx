import { MouseEvent } from 'react';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

import { ContactLink } from '@/ui/link/components/ContactLink';

type OwnProps = {
  value: string | null;
};

export function PhoneDisplay({ value }: OwnProps) {
  return value && isValidPhoneNumber(value) ? (
    <ContactLink
      href={parsePhoneNumber(value, 'FR')?.getURI()}
      onClick={(event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
      }}
    >
      {parsePhoneNumber(value, 'FR')?.formatInternational() || value}
    </ContactLink>
  ) : (
    <ContactLink href="#">{value}</ContactLink>
  );
}
