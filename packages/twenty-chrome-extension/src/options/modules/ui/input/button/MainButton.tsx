import React from 'react';
import styled from '@emotion/styled';

type Variant = 'primary' | 'secondary';

type MainButtonProps = {
  title: string;
  fullWidth?: boolean;
  width?: number;
  variant?: Variant;
  soon?: boolean;
} & React.ComponentProps<'button'>;

const StyledButton = styled.button<
  Pick<MainButtonProps, 'fullWidth' | 'width' | 'variant'>
>`
  align-items: center;
  background: ${({ theme, variant, disabled }) => {
    if (disabled === true) {
      return theme.background.secondary;
    }

    switch (variant) {
      case 'primary':
        return theme.background.primaryInverted;
      case 'secondary':
        return theme.background.primary;
      default:
        return theme.background.primary;
    }
  }};
  border: 1px solid;
  border-color: ${({ theme, disabled, variant }) => {
    if (disabled === true) {
      return theme.background.transparent.lighter;
    }

    switch (variant) {
      case 'primary':
        return theme.background.transparent.strong;
      case 'secondary':
        return theme.border.color.medium;
      default:
        return theme.background.primary;
    }
  }};
  border-radius: ${({ theme }) => theme.border.radius.md};
  ${({ theme, disabled }) => {
    if (disabled === true) {
      return '';
    }

    return `box-shadow: ${theme.boxShadow.light};`;
  }}
  color: ${({ theme, variant, disabled }) => {
    if (disabled === true) {
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
  width: ${({ fullWidth, width }) =>
    fullWidth ? '100%' : width ? `${width}px` : 'auto'};
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
            background: ${theme.background.primaryInvertedHover}};
          }
        `;
    }
  }};
`;

export const MainButton = ({
  title,
  width,
  fullWidth = false,
  variant = 'primary',
  type,
  onClick,
  disabled,
  className,
}: MainButtonProps) => {
  return (
    <StyledButton
      className={className}
      {...{ disabled, fullWidth, width, onClick, type, variant }}
    >
      {title}
    </StyledButton>
  );
};
