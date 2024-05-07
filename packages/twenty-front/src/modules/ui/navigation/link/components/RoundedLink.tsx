import * as React from 'react';
import { Link as ReactLink } from 'react-router-dom';
import styled from '@emotion/styled';
import { Chip, ChipSize, ChipVariant } from 'twenty-ui';

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
    overflow: hidden;
    text-decoration: none;
    text-overflow: ellipsis;
  }
`;

const StyledChip = styled(Chip)`
  box-sizing: border-box;
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const RoundedLink = ({ children, href, onClick }: RoundedLinkProps) => (
  <div>
    {children !== '' ? (
      <StyledClickable>
        <ReactLink target="_blank" to={href} onClick={onClick}>
          <StyledChip
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
