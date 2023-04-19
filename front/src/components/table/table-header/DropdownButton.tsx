import styled from '@emotion/styled';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useRef } from 'react';
import { useOutsideAlerter } from '../../../hooks/useOutsideAlerter';
import { modalBackground } from '../../../layout/styles/themes';

type OwnProps = {
  label: string;
  options: Array<{ label: string; icon: IconProp }>;
};

const StyledDropdownButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

type StyledDropdownButtonProps = {
  isUnfolded: boolean;
};

const StyledDropdownButton = styled.div<StyledDropdownButtonProps>`
  display: flex;
  margin-left: ${(props) => props.theme.spacing(3)};
  cursor: pointer;
  background: ${(props) => props.theme.primaryBackground};
  padding: ${(props) => props.theme.spacing(1)};
  border-radius: 4px;
  filter: ${(props) => (props.isUnfolded ? 'brightness(0.95)' : 'none')};

  &:hover {
    filter: brightness(0.95);
  }
`;

const StyledDropdown = styled.ul`
  display: flex;
  position: absolute;
  top: 14px;
  right: 0;
  border: 1px solid ${(props) => props.theme.primaryBorder};
  box-shadow: 0px 3px 12px rgba(0, 0, 0, 0.09);
  border-radius: 8px;
  padding: 0px;
  min-width: 160px;
  ${modalBackground}
`;

const StyledDropdownItem = styled.li`
  display: flex;
  padding: ${(props) => props.theme.spacing(2)}
    calc(${(props) => props.theme.spacing(2)} - 2px);
  margin: 2px;
  background: ${(props) => props.theme.primaryBackground};
  cursor: pointer;
  width: 100%;
  border-radius: 4px;
  color: ${(props) => props.theme.text60};

  &:hover {
    filter: brightness(0.95);
  }
`;

const StyledIcon = styled.div`
  display: flex;
  margin-right: ${(props) => props.theme.spacing(1)};
`;

function DropdownButton({ label, options }: OwnProps) {
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
      <StyledDropdownButton isUnfolded={isUnfolded} onClick={onButtonClick}>
        {label}
      </StyledDropdownButton>
      {isUnfolded && options.length > 0 && (
        <StyledDropdown ref={dropdownRef}>
          {options.map((option, index) => (
            <StyledDropdownItem key={index}>
              <StyledIcon>
                <FontAwesomeIcon icon={option.icon} />
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
