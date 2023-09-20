import React from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/icon/types/IconComponent';

type Variant = 'primary' | 'secondary';

type Props = {
  title: string;
  fullWidth?: boolean;
  variant?: Variant;
  soon?: boolean;
} & React.ComponentProps<'button'>;

const StyledButton = styled.button<Pick<Props, 'fullWidth' | 'variant'>>`
  align-items: center;
  background: ${({ theme, variant, disabled }) => {
    if (disabled) {
      return theme.background.secondary;
    }

    switch (variant) {
      case 'primary':
        return theme.background.radialGradient;
      case 'secondary':
        return theme.background.primary;
      default:
        return theme.background.primary;
    }
  }};
  border: 1px solid;
  border-color: ${({ theme, disabled }) => {
    if (disabled) {
      return theme.background.transparent.lighter;
    }

    return theme.border.color.light;
  }};
  border-radius: ${({ theme }) => theme.border.radius.md};
  ${({ theme, disabled }) => {
    if (disabled) {
      return '';
    }

    return `box-shadow: ${theme.boxShadow.light};`;
  }}
  color: ${({ theme, variant, disabled }) => {
    if (disabled) {
      return theme.font.color.light;
    }

    switch (variant) {
      case 'primary':
        return theme.font.color.inverted;
      case 'secondary':
        return theme.font.color.primary;
      default:
        return theme.font.color.primary;
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;
  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  ${({ theme, variant }) => {
    switch (variant) {
      case 'secondary':
        return `
          &:hover {
            background: ${theme.background.tertiary};
          }
        `;
      default:
        return `
          &:hover {
            background: ${theme.background.radialGradientHover}};
          }
        `;
    }
  }};
`;

type MainButtonProps = Props & {
  Icon?: IconComponent;
};

export const MainButton = ({
  Icon,
  title,
  fullWidth = false,
  variant = 'primary',
  ...props
}: MainButtonProps) => {
  const theme = useTheme();
  return (
    <StyledButton fullWidth={fullWidth} variant={variant} {...props}>
      {Icon && <Icon size={theme.icon.size.sm} />}
      {title}
    </StyledButton>
  );
};
