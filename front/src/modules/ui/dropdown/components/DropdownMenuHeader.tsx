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
`;

const StyledStartIconWrapper = styled.span`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  display: inline-flex;
  margin-right: ${({ theme }) => theme.spacing(2)};

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
  onClick,
  ...props
}: DropdownMenuHeaderProps) => {
  const theme = useTheme();

  return (
    // eslint-disable-next-line twenty/no-spread-props
    <StyledHeader {...props}>
      {StartIcon && (
        <StyledStartIconWrapper onClick={onClick}>
          <StartIcon size={theme.icon.size.lg} />
        </StyledStartIconWrapper>
      )}
      {children}
      {EndIcon && (
        <StyledEndIconWrapper onClick={onClick}>
          <EndIcon size={theme.icon.size.lg} />
        </StyledEndIconWrapper>
      )}
    </StyledHeader>
  );
};
