import { MouseEvent } from 'react';
import styled from '@emotion/styled';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

import { RawLink } from '@/ui/link/components/RawLink';

const StyledRawLink = styled(RawLink)`
  overflow: hidden;

  a {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

type OwnProps = {
  value: string;
};

export function InplaceInputPhoneDisplayMode({ value }: OwnProps) {
  return isValidPhoneNumber(value) ? (
    <StyledRawLink
      href={parsePhoneNumber(value, 'FR')?.getURI()}
      onClick={(event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
      }}
    >
      {parsePhoneNumber(value, 'FR')?.formatInternational() || value}
    </StyledRawLink>
  ) : (
    <StyledRawLink href="#">{value}</StyledRawLink>
  );
}
