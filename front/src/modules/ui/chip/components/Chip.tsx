import * as React from 'react';
import styled from '@emotion/styled';

import { OverflowingTextWithTooltip } from '../../tooltip/OverflowingTextWithTooltip';

export enum ChipSize {
  Large = 'large',
  Small = 'small',
}

export enum ChipVariant {
  Highlighted = 'highlighted',
  Regular = 'regular',
  Transparent = 'transparent',
}

type OwnProps = {
  size?: ChipSize;
  disabled?: boolean;
  clickable?: boolean;
  label: string;
  maxWidth?: string;
  variant?: ChipVariant;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  className?: string;
};

const StyledContainer = styled.div<Partial<OwnProps>>`
  align-items: center;

  background-color: ${({ theme, variant }) =>
    variant === ChipVariant.Highlighted
      ? theme.background.transparent.light
      : 'transparent'};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme, disabled }) =>
    disabled ? theme.font.color.light : theme.font.color.primary};
  cursor: ${({ clickable, disabled, variant }) =>
    disabled || variant === ChipVariant.Transparent
      ? 'auto'
      : clickable
      ? 'pointer'
      : 'auto'};
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(1)};

  height: ${({ size }) => (size === ChipSize.Large ? '16px' : '12px')};
  max-width: ${({ maxWidth }) => (maxWidth ? maxWidth : '200px')};

  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(1)};
  user-select: none;

  :hover {
    ${({ variant, theme, disabled }) => {
      if (!disabled) {
        return (
          'background-color: ' +
          (variant === ChipVariant.Highlighted
            ? theme.background.transparent.medium
            : variant === ChipVariant.Regular
            ? theme.background.transparent.light
            : 'transparent') +
          ';'
        );
      }
    }}
  }
  :active {
    ${({ variant, theme, disabled }) => {
      if (!disabled) {
        return (
          'background-color: ' +
          (variant === ChipVariant.Highlighted
            ? theme.background.transparent.strong
            : variant === ChipVariant.Regular
            ? theme.background.transparent.medium
            : 'transparent') +
          ';'
        );
      }
    }}
  }
`;

const StyledLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function Chip({
  size = ChipSize.Small,
  label,
  disabled = false,
  clickable = true,
  variant = ChipVariant.Regular,
  leftComponent,
  rightComponent,
  maxWidth,
  className,
}: OwnProps) {
  return (
    <StyledContainer
      data-testid="chip"
      clickable={clickable}
      variant={variant}
      size={size}
      disabled={disabled}
      className={className}
    >
      {leftComponent}
      <StyledLabel>
        <OverflowingTextWithTooltip text={label} />
      </StyledLabel>
      {rightComponent}
    </StyledContainer>
  );
}
