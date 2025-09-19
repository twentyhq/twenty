import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import type { IconComponent } from 'twenty-ui/display';

export type FloatingIconButtonSize = 'small' | 'medium';
export type FloatingIconButtonPosition =
  | 'standalone'
  | 'left'
  | 'middle'
  | 'right';

export type BubbleMenuIconButtonProps = {
  className?: string;
  Icon?: IconComponent;
  size?: FloatingIconButtonSize;
  position?: FloatingIconButtonPosition;
  applyShadow?: boolean;
  applyBlur?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
};
const shouldForwardProp = (prop: string) =>
  ![
    'applyBlur',
    'applyShadow',
    'isActive',
    'focus',
    'position',
    'size',
  ].includes(prop);

const StyledButton = styled('button', { shouldForwardProp })<
  Pick<
    BubbleMenuIconButtonProps,
    'size' | 'position' | 'applyShadow' | 'applyBlur' | 'focus' | 'isActive'
  >
>`
  align-items: center;
  background: ${({ theme, isActive }) =>
    isActive ? theme.background.transparent.medium : theme.background.primary};
  border: none;
  border-radius: ${({ theme }) => theme.spacing(1.5)};
  box-sizing: border-box;
  color: ${({ theme, disabled, focus }) => {
    return !disabled
      ? focus
        ? theme.color.blue
        : theme.font.color.tertiary
      : theme.font.color.extraLight;
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;

  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  padding: 0;
  position: relative;
  transition: background ${({ theme }) => theme.animation.duration.instant}s
    ease;
  white-space: nowrap;
  width: ${({ theme }) => theme.spacing(6)};
  height: ${({ theme }) => theme.spacing(6)};

  ${({ theme, disabled }) =>
    !disabled &&
    css`
      &:hover {
        background: ${theme.background.transparent.lighter};
      }
    `}

  &:active {
    background: ${({ theme, disabled }) =>
      !disabled ? theme.background.transparent.medium : 'transparent'};
  }

  &:focus {
    outline: none;
  }
`;

export const BubbleMenuIconButton = ({
  className,
  Icon,
  size = 'small',
  position = 'standalone',
  applyShadow = true,
  applyBlur = true,
  disabled = false,
  focus = false,
  onClick,
  isActive,
}: BubbleMenuIconButtonProps) => {
  const theme = useTheme();
  return (
    <StyledButton
      disabled={disabled}
      focus={focus && !disabled}
      size={size}
      applyShadow={applyShadow}
      applyBlur={applyBlur}
      className={className}
      position={position}
      onClick={onClick}
      isActive={isActive}
    >
      {Icon && <Icon size={theme.icon.size.md} />}
    </StyledButton>
  );
};
