import React from 'react';
import styled from '@emotion/styled';

const StyledButtonLink = styled.a`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: 0 ${({ theme }) => theme.spacing(1)};
  text-decoration: none;

  :hover {
    color: ${({ theme }) => theme.font.color.tertiary};
    cursor: pointer;
  }
`;

export const LinkButton = ({
  onClick,
  href,
  target,
  rel,
  children,
}: React.ComponentProps<'a'>) => {
  return (
    <StyledButtonLink href={href} onClick={onClick} target={target} rel={rel}>
      {children}
    </StyledButtonLink>
  );
};
