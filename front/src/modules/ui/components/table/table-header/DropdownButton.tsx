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
  display: flex;
  cursor: pointer;
  user-select: none;
  background: ${(props) => props.theme.primaryBackground};
  color: ${(props) => (props.isActive ? props.theme.blue : 'none')};
  padding: ${(props) => props.theme.spacing(1)};

  padding-right: ${(props) => props.theme.spacing(2)};
  padding-left: ${(props) => props.theme.spacing(2)};

  border-radius: 4px;
  filter: ${(props) => (props.isUnfolded ? 'brightness(0.95)' : 'none')};

  &:hover {
    filter: brightness(0.95);
  }
`;

const StyledDropdown = styled.ul`
  --wraper-border: 1px;
  --wraper-border-radius: 8px;
  --outer-border-radius: calc(var(--wraper-border-radius) - 2px);

  display: flex;
  flex-direction: column;
  position: absolute;
  top: 14px;
  right: 0;
  border: var(--wraper-border) solid ${(props) => props.theme.primaryBorder};
  border-radius: var(--wraper-border-radius);
  padding: 0px;
  min-width: 160px;
  ${overlayBackground}
  li {
    &:first-of-type {
      border-top-left-radius: var(--outer-border-radius);
      border-top-right-radius: var(--outer-border-radius);
    }
    &:last-of-type {
      border-bottom-left-radius: var(--outer-border-radius);
      border-bottom-right-radius: var(--outer-border-radius);
      border-bottom: 0;
    }
  }
`;

const StyledDropdownItem = styled.li`
  display: flex;
  align-items: center;
  width: calc(160px - ${(props) => props.theme.spacing(4)});
  padding: ${(props) => props.theme.spacing(2)}
    calc(${(props) => props.theme.spacing(2)} - 2px);
  margin: 2px;
  cursor: pointer;
  user-select: none;
  color: ${(props) => props.theme.text60};
  border-radius: 2px;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

const StyledDropdownItemClipped = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const StyledDropdownTopOption = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(${(props) => props.theme.spacing(2)} + 2px)
    calc(${(props) => props.theme.spacing(2)});
  cursor: pointer;
  user-select: none;
  color: ${(props) => props.theme.text80};
  font-weight: ${(props) => props.theme.fontWeightMedium};

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
  border-bottom: 1px solid ${(props) => props.theme.primaryBorder};
`;

const StyledIcon = styled.div`
  display: flex;
  margin-right: ${(props) => props.theme.spacing(1)};
  min-width: ${(props) => props.theme.spacing(4)};
  justify-content: center;
`;

const StyledSearchField = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;

  cursor: pointer;
  user-select: none;
  color: ${(props) => props.theme.text60};
  font-weight: ${(props) => props.theme.fontWeightMedium};
  border-bottom: var(--wraper-border) solid
    ${(props) => props.theme.primaryBorder};

  overflow: hidden;
  input {
    height: 36px;
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    font-family: ${(props) => props.theme.fontFamily};
    border-radius: 8px;

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
