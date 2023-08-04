import { ComponentProps, ReactElement } from 'react';
import styled from '@emotion/styled';

const StyledHeader = styled.li`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};

  padding: calc(${({ theme }) => theme.spacing(2)})
    calc(${({ theme }) => theme.spacing(2)});

  user-select: none;

  ${({ onClick, theme }) => {
    if (onClick) {
      return `
        cursor: pointer;

        &:hover {
          background: ${theme.background.transparent.light};
        }
      `;
    }
  }}
`;

const StyledStartIconWrapper = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: inline-flex;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledEndIconWrapper = styled(StyledStartIconWrapper)`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: inline-flex;
  margin-left: auto;
  margin-right: 0;
`;

type DropdownMenuHeaderProps = ComponentProps<'li'> & {
  startIcon?: ReactElement;
  endIcon?: ReactElement;
};

export const DropdownMenuHeader = ({
  children,
  startIcon,
  endIcon,
  ...props
}: DropdownMenuHeaderProps) => (
  <StyledHeader {...props}>
    {startIcon && <StyledStartIconWrapper>{startIcon}</StyledStartIconWrapper>}
    {children}
    {endIcon && <StyledEndIconWrapper>{endIcon}</StyledEndIconWrapper>}
  </StyledHeader>
);
