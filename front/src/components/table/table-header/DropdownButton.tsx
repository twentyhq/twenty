import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useRef } from 'react';
import { useOutsideAlerter } from '../../../hooks/useOutsideAlerter';
import { modalBackground } from '../../../layout/styles/themes';
import { SortType } from './SortAndFilterBar';

type OwnProps = {
  label: string;
  options: Array<SortType>;
  isActive: boolean;
  onSortSelect?: (id: string) => void;
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
  margin-left: ${(props) => props.theme.spacing(3)};
  cursor: pointer;
  background: ${(props) => props.theme.primaryBackground};
  color: ${(props) => (props.isActive ? props.theme.blue : 'none')};
  padding: ${(props) => props.theme.spacing(1)};
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
  box-shadow: 0px 3px 12px rgba(0, 0, 0, 0.09);
  border-radius: var(--wraper-border-radius);
  padding: 0px;
  min-width: 160px;
  ${modalBackground}
  li {
    border-radius: 2px;

    &:first-child {
      border-top-left-radius: var(--outer-border-radius);
      border-top-right-radius: var(--outer-border-radius);
    }
    &:last-child {
      border-bottom-left-radius: var(--outer-border-radius);
      border-bottom-right-radius: var(--outer-border-radius);
    }
  }
`;

const StyledDropdownItem = styled.li`
  display: flex;
  padding: ${(props) => props.theme.spacing(2)}
    calc(${(props) => props.theme.spacing(2)} - 2px);
  margin: 2px;
  background: rgba(0, 0, 0, 0);
  cursor: pointer;
  color: ${(props) => props.theme.text60};

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

const StyledIcon = styled.div`
  display: flex;
  margin-right: ${(props) => props.theme.spacing(1)};
`;

function DropdownButton({ label, options, onSortSelect, isActive }: OwnProps) {
  const [isUnfolded, setIsUnfolded] = useState(false);

  const onButtonClick = () => {
    setIsUnfolded(!isUnfolded);
  };

  const onOutsideClick = () => {
    setIsUnfolded(false);
  };

  const dropdownRef = useRef(null);
  useOutsideAlerter(dropdownRef, onOutsideClick);

  return (
    <StyledDropdownButtonContainer>
      <StyledDropdownButton
        isUnfolded={isUnfolded}
        onClick={onButtonClick}
        isActive={isActive}
      >
        {label}
      </StyledDropdownButton>
      {isUnfolded && options.length > 0 && (
        <StyledDropdown ref={dropdownRef}>
          {options.map((option, index) => (
            <StyledDropdownItem
              key={index}
              onClick={() => {
                setIsUnfolded(false);
                if (onSortSelect) {
                  onSortSelect(option.id);
                }
              }}
            >
              <StyledIcon>
                {option.icon && <FontAwesomeIcon icon={option.icon} />}
              </StyledIcon>
              {option.label}
            </StyledDropdownItem>
          ))}
        </StyledDropdown>
      )}
    </StyledDropdownButtonContainer>
  );
}

export default DropdownButton;
