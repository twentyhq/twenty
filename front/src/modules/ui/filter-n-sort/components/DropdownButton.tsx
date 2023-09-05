import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

import { DropdownMenuContainer } from './DropdownMenuContainer';

type OwnProps = {
  anchor?: 'left' | 'right';
  label: ReactNode;
  isActive: boolean;
  children?: ReactNode;
  isUnfolded?: boolean;
  icon?: ReactNode;
  onIsUnfoldedChange?: (newIsUnfolded: boolean) => void;
  resetState?: () => void;
  HotkeyScope: string;
  color?: string;
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

function DropdownButton({
  anchor,
  label,
  isActive,
  children,
  isUnfolded = false,
  onIsUnfoldedChange,
  HotkeyScope,
  icon,
  color,
}: OwnProps) {
  useScopedHotkeys(
    [Key.Enter, Key.Escape],
    () => {
      onIsUnfoldedChange?.(false);
    },
    HotkeyScope,
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
        {icon && <StyledDropdownButtonIcon>{icon}</StyledDropdownButtonIcon>}
        {label}
      </StyledDropdownButton>
      {isUnfolded && (
        <DropdownMenuContainer anchor={anchor} onClose={onOutsideClick}>
          {children}
        </DropdownMenuContainer>
      )}
    </StyledDropdownButtonContainer>
  );
}

export default DropdownButton;
