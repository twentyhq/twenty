import * as React from 'react';
import { Link as ReactLink } from 'react-router-dom';
import styled from '@emotion/styled';
import { Chip, ChipSize, ChipVariant } from 'twenty-ui';

type RoundedLinkProps = {
  href: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

const StyledLink = styled(ReactLink)`
  font-size: ${({ theme }) => theme.font.size.md};
  max-width: 100%;
  height: ${({ theme }) => theme.spacing(5)};
`;

const StyledChip = styled(Chip)`
  border-color: ${({ theme }) => theme.border.color.strong};
  box-sizing: border-box;
  padding: ${({ theme }) => theme.spacing(0, 2)};
  max-width: 100%;
  height: ${({ theme }) => theme.spacing(5)};
  min-width: 40px;
`;

export const RoundedLink = ({
  children,
  className,
  href,
  onClick,
}: RoundedLinkProps) => {
  if (!children) return null;

  return (
    <StyledLink
      className={className}
      target="_blank"
      to={href}
      onClick={onClick}
    >
      <StyledChip
        label={`${children}`}
        variant={ChipVariant.Rounded}
        size={ChipSize.Large}
      />
    </StyledLink>
  );
};
