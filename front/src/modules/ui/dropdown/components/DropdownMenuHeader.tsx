import { ComponentProps } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/icon/types/IconComponent';

const StyledHeader = styled.li`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};

  padding: ${({ theme }) => theme.spacing(2)};

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
  StartIcon?: IconComponent;
  EndIcon?: IconComponent;
};

export const DropdownMenuHeader = ({
  children,
  StartIcon,
  EndIcon,
  ...props
}: DropdownMenuHeaderProps) => {
  const theme = useTheme();

  return (
    <StyledHeader {...props}>
      {StartIcon && (
        <StyledStartIconWrapper>
          <StartIcon size={theme.icon.size.md} />
        </StyledStartIconWrapper>
      )}
      {children}
      {EndIcon && (
        <StyledEndIconWrapper>
          <EndIcon size={theme.icon.size.md} />
        </StyledEndIconWrapper>
      )}
    </StyledHeader>
  );
};
