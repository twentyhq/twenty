import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

import { FiltersHotkeyScope } from '../types/FiltersHotkeyScope';

import { DropdownMenuContainer } from './DropdownMenuContainer';

type OwnProps = {
  label: string;
  isActive: boolean;
  children?: ReactNode;
  isUnfolded?: boolean;
  onIsUnfoldedChange?: (newIsUnfolded: boolean) => void;
  resetState?: () => void;
  HotkeyScope: FiltersHotkeyScope;
};

const StyledDropdownButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
`;

type StyledDropdownButtonProps = {
  isUnfolded: boolean;
  isActive: boolean;
};

const StyledDropdownButton = styled.div<StyledDropdownButtonProps>`
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${(props) => (props.isActive ? props.theme.color.blue : 'none')};
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
  label,
  isActive,
  children,
  isUnfolded = false,
  onIsUnfoldedChange,
  HotkeyScope,
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
      >
        {label}
      </StyledDropdownButton>
      {isUnfolded && (
        <DropdownMenuContainer onClose={onOutsideClick}>
          {children}
        </DropdownMenuContainer>
      )}
    </StyledDropdownButtonContainer>
  );
}

export default DropdownButton;
