import { MouseEvent } from 'react';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import { ContactLink } from 'twenty-ui';

import { EllipsisDisplay } from './EllipsisDisplay';

type PhoneDisplayProps = {
  value: string | null;
};

export const PhoneDisplay = ({ value }: PhoneDisplayProps) => (
  <EllipsisDisplay>
    {value && isValidPhoneNumber(value) ? (
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
    )}
  </EllipsisDisplay>
);
