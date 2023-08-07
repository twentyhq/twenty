import * as React from 'react';
import { Link as ReactLink } from 'react-router-dom';
import styled from '@emotion/styled';

import { Chip } from '@/ui/chip/components/Chip';
import { ChipSize, ChipVariant } from '@/ui/chip/components/Chip';

type OwnProps = {
  href: string;
  children?: React.ReactNode;
  type?: string;
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

export function RoundedLink({ children, href, onClick, type }: OwnProps) {
  let displayValue = children;

  if (type === 'linkedin') {
    const splitUrl = href.split('/');
    displayValue = splitUrl[4];
  }

  if (type === 'twitter') {
    const splitUrl = href.split('/');
    displayValue = `@${splitUrl[3]}`;
  }

  return (
    <div>
      {children !== '' ? (
        <StyledClickable>
          <ReactLink target="_blank" to={href} onClick={onClick}>
            <Chip
              label={`${displayValue}`}
              variant={ChipVariant.Rounded}
              size={ChipSize.Large}
            />
          </ReactLink>
        </StyledClickable>
      ) : (
        <></>
      )}
    </div>
  );
}
