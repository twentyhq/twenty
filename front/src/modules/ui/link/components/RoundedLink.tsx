import * as React from 'react';
import { Link as ReactLink } from 'react-router-dom';
import styled from '@emotion/styled';

import { Chip } from '@/ui/chip/components/Chip';
import { ChipSize, ChipVariant } from '@/ui/chip/components/Chip';

type RoundedLinkProps = {
  href: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

const StyledClickable = styled.div`
  overflow: hidden;
  white-space: nowrap;

  a {
    color: inherit;
    text-decoration: none;
  }
`;

export const RoundedLink = ({ children, href, onClick }: RoundedLinkProps) => (
  <div>
    {children !== '' ? (
      <StyledClickable>
        <ReactLink target="_blank" to={href} onClick={onClick}>
          <Chip
            label={`${children}`}
            variant={ChipVariant.Rounded}
            size={ChipSize.Small}
          />
        </ReactLink>
      </StyledClickable>
    ) : (
      <></>
    )}
  </div>
);
