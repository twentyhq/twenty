import { ComponentType, ReactNode } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

import { DropdownMenuContainer } from './DropdownMenuContainer';

type OwnProps<T> = {
  anchor?: 'left' | 'right';
  label: ReactNode;
  isActive: boolean;
  children?: ReactNode;
  isUnfolded?: boolean;
  Icon?: ComponentType<T>;
  iconProps?: T;
  onIsUnfoldedChange?: (newIsUnfolded: boolean) => void;
  resetState?: () => void;
  hotkeyScope: string;
  color?: string;
  menuWidth?: `${string}px` | 'auto' | number;
};

const StyledDropdownButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledDropdownButtonIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

type StyledDropdownButtonProps = {
  isUnfolded: boolean;
  isActive: boolean;
};

const StyledDropdownButton = styled.div<StyledDropdownButtonProps>`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ isActive, theme, color }) =>
    color ?? (isActive ? theme.color.blue : 'none')};
  cursor: pointer;
  display: flex;
  filter: ${(props) => (props.isUnfolded ? 'brightness(0.95)' : 'none')};

  padding: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};

  padding-right: ${({ theme }) => theme.spacing(2)};
  user-select: none;

  &:hover {
    filter: brightness(0.95);
  }
`;

function DropdownButton<T extends Record<string, unknown>>({
  anchor,
  label,
  isActive,
  children,
  isUnfolded = false,
  onIsUnfoldedChange,
  Icon,
  hotkeyScope,
  color,
  menuWidth,
}: OwnProps<T>) {
  useScopedHotkeys(
    [Key.Enter, Key.Escape],
    () => {
      onIsUnfoldedChange?.(false);
    },
    hotkeyScope,
    [onIsUnfoldedChange],
  );

  const onButtonClick = () => {
    onIsUnfoldedChange?.(!isUnfolded);
  };

  const onOutsideClick = () => {
    onIsUnfoldedChange?.(false);
  };

  return (
    <StyledDropdownButtonContainer>
      <StyledDropdownButton
        isUnfolded={isUnfolded}
        onClick={onButtonClick}
        isActive={isActive}
        aria-selected={isActive}
        color={color}
      >
        {Icon && (
          <StyledDropdownButtonIcon>
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment  */}
            {/* @ts-ignore */}
            {<Icon {...iconProps} />}
          </StyledDropdownButtonIcon>
        )}
        {label}
      </StyledDropdownButton>
      {isUnfolded && (
        <DropdownMenuContainer
          width={menuWidth}
          anchor={anchor}
          onClose={onOutsideClick}
        >
          {children}
        </DropdownMenuContainer>
      )}
    </StyledDropdownButtonContainer>
  );
}

export default DropdownButton;
