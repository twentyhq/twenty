import { ReactNode, useRef } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/lib/hotkeys/hooks/useScopedHotkeys';
import { useOutsideAlerter } from '@/ui/hooks/useOutsideAlerter';
import { IconChevronDown } from '@/ui/icons/index';
import { overlayBackground, textInputStyle } from '@/ui/themes/effects';

import { FiltersHotkeyScope } from '../types/FiltersHotkeyScope';

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

const StyledDropdown = styled.ul`
  --outer-border-radius: calc(var(--wraper-border-radius) - 2px);
  --wraper-border: 1px;
  --wraper-border-radius: ${({ theme }) => theme.border.radius.md};

  border: var(--wraper-border) solid ${({ theme }) => theme.border.color.light};
  border-radius: var(--wraper-border-radius);
  display: flex;
  flex-direction: column;
  min-width: 160px;
  padding: 0px;
  position: absolute;
  right: 0;
  top: 14px;
  ${overlayBackground}
  li {
    &:first-of-type {
      border-top-left-radius: var(--outer-border-radius);
      border-top-right-radius: var(--outer-border-radius);
    }
    &:last-of-type {
      border-bottom: 0;
      border-bottom-left-radius: var(--outer-border-radius);
      border-bottom-right-radius: var(--outer-border-radius);
    }
  }
`;

const StyledDropdownItem = styled.li`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.xs};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  margin: 2px;
  padding: ${({ theme }) => theme.spacing(2)}
    calc(${({ theme }) => theme.spacing(2)} - 2px);
  user-select: none;
  width: calc(160px - ${({ theme }) => theme.spacing(4)});

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledDropdownItemClipped = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDropdownTopOption = styled.li`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  justify-content: space-between;
  padding: calc(${({ theme }) => theme.spacing(2)})
    calc(${({ theme }) => theme.spacing(2)});

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
  user-select: none;
`;

const StyledIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing(1)};
  min-width: ${({ theme }) => theme.spacing(4)};
`;

const StyledSearchField = styled.li`
  align-items: center;
  border-bottom: var(--wraper-border) solid
    ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.secondary};

  cursor: pointer;
  display: flex;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  justify-content: space-between;
  overflow: hidden;

  user-select: none;
  input {
    border-radius: ${({ theme }) => theme.border.radius.md};
    box-sizing: border-box;
    font-family: ${({ theme }) => theme.font.family};
    height: 36px;
    padding: 8px;
    width: 100%;

    ${textInputStyle}

    &:focus {
      outline: 0 none;
    }
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

  const dropdownRef = useRef(null);
  useOutsideAlerter({ ref: dropdownRef, callback: onOutsideClick });

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
        <StyledDropdown ref={dropdownRef}>{children}</StyledDropdown>
      )}
    </StyledDropdownButtonContainer>
  );
}

const StyleAngleDownContainer = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  height: 100%;
  justify-content: center;
  margin-left: auto;
`;

function DropdownTopOptionAngleDown() {
  return (
    <StyleAngleDownContainer>
      <IconChevronDown size={16} />
    </StyleAngleDownContainer>
  );
}
DropdownButton.StyledDropdownItem = StyledDropdownItem;
DropdownButton.StyledDropdownItemClipped = StyledDropdownItemClipped;
DropdownButton.StyledSearchField = StyledSearchField;
DropdownButton.StyledDropdownTopOption = StyledDropdownTopOption;
DropdownButton.StyledDropdownTopOptionAngleDown = DropdownTopOptionAngleDown;
DropdownButton.StyledIcon = StyledIcon;

export default DropdownButton;
