import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

type OwnProps = {
  label: string;
  to: string;
  active?: boolean;
  icon: IconProp;
};

type StyledItemProps = {
  active?: boolean;
};

const StyledItem = styled.button<StyledItemProps>`
  display: flex;
  border: none;
  font-size: 12px;
  cursor: pointer;
  background: ${(props) => (props.active ? 'rgba(0, 0, 0, 0.04)' : 'inherit')};
  padding-top: 4px;
  padding-bottom: 4px;
  padding-left: 4px;
  font-family: 'Inter';
  color: ${(props) =>
    props.active ? props.theme.text100 : props.theme.text60};
  border-radius: 4px;
  :hover {
    background: rgba(0, 0, 0, 0.04);
    color: ${(props) => props.theme.text100};
  }
`;

const StyledItemLabel = styled.div`
  display: flex;
  margin-left: 8px;
`;

function NavItem({ label, icon, to, active }: OwnProps) {
  const navigate = useNavigate();

  return (
    <StyledItem
      onClick={() => {
        navigate(to);
      }}
      active={active}
      aria-selected={active}
    >
      <FontAwesomeIcon icon={icon} />
      <StyledItemLabel>{label}</StyledItemLabel>
    </StyledItem>
  );
}

export default NavItem;
