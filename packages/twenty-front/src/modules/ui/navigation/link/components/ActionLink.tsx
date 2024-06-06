import React from 'react';
import styled from '@emotion/styled';

const StyledButtonLink = styled.a<{ enhanced: boolean }>`
  align-items: center;
  color: ${({ theme, enhanced }) =>
    enhanced ? theme.font.color.tertiary : theme.font.color.light};
  display: flex;
  font-size: ${({ theme, enhanced }) =>
    enhanced ? theme.font.size.md : theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: 0 ${({ theme }) => theme.spacing(1)};
  text-decoration: none;

  :hover {
    color: ${({ theme }) => theme.font.color.tertiary};
    cursor: pointer;
  }
`;

type ActionLinkProps = React.ComponentProps<'a'> & {
  enhanced?: boolean;
};

export const ActionLink = ({
  href,
  onClick,
  target,
  rel,
  enhanced = false,
  children,
}: ActionLinkProps) => {
  return (
    <StyledButtonLink
      href={href}
      onClick={onClick}
      target={target}
      rel={rel}
      enhanced={enhanced}
    >
      {children}
    </StyledButtonLink>
  );
};
