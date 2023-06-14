import { ReactNode, useRef } from 'react';
import styled from '@emotion/styled';

import { IconChevronDown } from '@/ui/icons/index';

import { useOutsideAlerter } from '../../../hooks/useOutsideAlerter';
import {
  overlayBackground,
  textInputStyle,
} from '../../../layout/styles/themes';

type OwnProps = {
  label: string;
  isActive: boolean;
  children?: ReactNode;
  isUnfolded?: boolean;
  setIsUnfolded?: React.Dispatch<React.SetStateAction<boolean>>;
  resetState?: () => void;
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
  background: ${(props) => props.theme.primaryBackground};
  border-radius: 4px;
  color: ${(props) => (props.isActive ? props.theme.blue : 'none')};
  cursor: pointer;
  display: flex;
  filter: ${(props) => (props.isUnfolded ? 'brightness(0.95)' : 'none')};

  padding: ${(props) => props.theme.spacing(1)};
  padding-left: ${(props) => props.theme.spacing(2)};

  padding-right: ${(props) => props.theme.spacing(2)};
  user-select: none;

  &:hover {
    filter: brightness(0.95);
  }
`;

const StyledDropdown = styled.ul`
  --outer-border-radius: calc(var(--wraper-border-radius) - 2px);
  --wraper-border: 1px;
  --wraper-border-radius: 8px;

  border: var(--wraper-border) solid ${(props) => props.theme.primaryBorder};
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
  border-radius: 2px;
  color: ${(props) => props.theme.text60};
  cursor: pointer;
  display: flex;
  margin: 2px;
  padding: ${(props) => props.theme.spacing(2)}
    calc(${(props) => props.theme.spacing(2)} - 2px);
  user-select: none;
  width: calc(160px - ${(props) => props.theme.spacing(4)});

  &:hover {
    background: ${(props) => props.theme.lightBackgroundTransparent};
  }
`;

const StyledDropdownItemClipped = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDropdownTopOption = styled.li`
  align-items: center;
  border-bottom: 1px solid ${(props) => props.theme.primaryBorder};
  color: ${(props) => props.theme.text80};
  cursor: pointer;
  display: flex;
  font-weight: ${(props) => props.theme.fontWeightMedium};
  justify-content: space-between;
  padding: calc(${(props) => props.theme.spacing(2)} + 2px)
    calc(${(props) => props.theme.spacing(2)});

  &:hover {
    background: ${(props) => props.theme.lightBackgroundTransparent};
  }
  user-select: none;
`;

const StyledIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-right: ${(props) => props.theme.spacing(1)};
  min-width: ${(props) => props.theme.spacing(4)};
`;

const StyledSearchField = styled.li`
  align-items: center;
  border-bottom: var(--wraper-border) solid
    ${(props) => props.theme.primaryBorder};
  color: ${(props) => props.theme.text60};

  cursor: pointer;
  display: flex;
  font-weight: ${(props) => props.theme.fontWeightMedium};
  justify-content: space-between;
  overflow: hidden;

  user-select: none;
  input {
    border-radius: 8px;
    box-sizing: border-box;
    font-family: ${(props) => props.theme.fontFamily};
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
  setIsUnfolded,
  resetState,
}: OwnProps) {
  const onButtonClick = () => {
    setIsUnfolded && setIsUnfolded(!isUnfolded);
  };

  const onOutsideClick = () => {
    setIsUnfolded && setIsUnfolded(false);
    resetState && resetState();
  };

  const dropdownRef = useRef(null);
  useOutsideAlerter(dropdownRef, onOutsideClick);

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
  margin-left: auto;
`;

function DropdownTopOptionAngleDown() {
  return (
    <StyleAngleDownContainer>
      <IconChevronDown />
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
