import React from 'react';
import styled from '@emotion/styled';

type Variant = 'primary' | 'secondary';

type Props = {
  icon?: React.ReactNode;
  title: string;
  fullWidth?: boolean;
  variant?: Variant;
} & React.ComponentProps<'button'>;

const StyledButton = styled.button<Pick<Props, 'fullWidth' | 'variant'>>`
  align-items: center;
  background: ${({ theme, variant, disabled }) => {
    if (disabled) {
      return theme.background.tertiary;
    }

    switch (variant) {
      case 'primary':
        return `radial-gradient(
          50% 62.62% at 50% 0%,
          ${theme.font.color.secondary} 0%,
          ${theme.font.color.primary} 100%
        )`;
      case 'secondary':
        return theme.background.primary;
      default:
        return theme.background.primary;
    }
  }};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  color: ${({ theme, variant, disabled }) => {
    if (disabled) {
      return theme.font.color.extraLight;
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
        return '';
    }
  }};
`;

export function MainButton({
  icon,
  title,
  fullWidth = false,
  variant = 'primary',
  ...props
}: Props) {
  return (
    <StyledButton fullWidth={fullWidth} variant={variant} {...props}>
      {icon}
      {title}
    </StyledButton>
  );
}
