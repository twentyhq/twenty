import { MouseEvent, ReactNode } from 'react';
import styled from '@emotion/styled';

import { OverflowingTextWithTooltip } from '../../tooltip/OverflowingTextWithTooltip';

export enum ChipSize {
  Large = 'large',
  Small = 'small',
}

export enum ChipAccent {
  TextPrimary = 'text-primary',
  TextSecondary = 'text-secondary',
}

export enum ChipVariant {
  Highlighted = 'highlighted',
  Regular = 'regular',
  Transparent = 'transparent',
  Rounded = 'rounded',
}

type ChipProps = {
  size?: ChipSize;
  disabled?: boolean;
  clickable?: boolean;
  label: string;
  maxWidth?: number;
  variant?: ChipVariant;
  accent?: ChipAccent;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  className?: string;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
};

const StyledContainer = styled.div<Partial<ChipProps>>`
  align-items: center;

  background-color: ${({ theme, variant }) =>
    variant === ChipVariant.Highlighted
      ? theme.background.transparent.light
      : variant === ChipVariant.Rounded
        ? theme.background.transparent.lighter
        : 'transparent'};
  border-color: ${({ theme, variant }) =>
    variant === ChipVariant.Rounded ? theme.border.color.medium : 'none'};
  border-radius: ${({ theme, variant }) =>
    variant === ChipVariant.Rounded ? '50px' : theme.border.radius.sm};
  border-style: ${({ variant }) =>
    variant === ChipVariant.Rounded ? 'solid' : 'none'};
  border-width: ${({ variant }) =>
    variant === ChipVariant.Rounded ? '1px' : '0px'};

  color: ${({ theme, disabled, accent }) =>
    disabled
      ? theme.font.color.light
      : accent === ChipAccent.TextPrimary
        ? theme.font.color.primary
        : theme.font.color.secondary};
  cursor: ${({ clickable, disabled, variant }) =>
    disabled || variant === ChipVariant.Transparent
      ? 'inherit'
      : clickable
        ? 'pointer'
        : 'inherit'};
  display: inline-flex;
  font-weight: ${({ theme, accent }) =>
    accent === ChipAccent.TextSecondary ? theme.font.weight.medium : 'inherit'};
  gap: ${({ theme }) => theme.spacing(1)};

  height: ${({ size }) => (size === ChipSize.Large ? '16px' : '12px')};
  --chip-horizontal-padding: ${({ theme, variant }) =>
    variant === ChipVariant.Rounded ? theme.spacing(2) : theme.spacing(1)};
  max-width: ${({ maxWidth }) =>
    maxWidth
      ? `calc( ${maxWidth}px - 2*var(--chip-horizontal-padding))`
      : '200px'};

  --chip-vertical-padding: ${({ theme, variant }) =>
    variant === ChipVariant.Rounded ? '3px' : theme.spacing(1)};

  overflow: hidden;
  padding: var(--chip-vertical-padding) var(--chip-horizontal-padding);
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

export const Chip = ({
  size = ChipSize.Small,
  label,
  disabled = false,
  clickable = true,
  variant = ChipVariant.Regular,
  leftComponent,
  rightComponent,
  accent = ChipAccent.TextPrimary,
  maxWidth,
  className,
  onClick,
}: ChipProps) => (
  <StyledContainer
    data-testid="chip"
    clickable={clickable}
    variant={variant}
    accent={accent}
    size={size}
    disabled={disabled}
    className={className}
    maxWidth={maxWidth}
    onClick={onClick}
  >
    {leftComponent}
    <StyledLabel>
      <OverflowingTextWithTooltip text={label} />
    </StyledLabel>
    {rightComponent}
  </StyledContainer>
);
