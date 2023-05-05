import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';

type OwnProps = {
  label: string;
  to: string;
  active?: boolean;
  icon: ReactNode;
};

type StyledItemProps = {
  active?: boolean;
};

const StyledItem = styled.button<StyledItemProps>`
  display: flex;
  align-items: center;
  border: none;
  font-size: ${(props) => props.theme.fontSizeMedium};
  cursor: pointer;
  background: ${(props) => (props.active ? 'rgba(0, 0, 0, 0.04)' : 'inherit')};
  padding-top: ${(props) => props.theme.spacing(1)};
  padding-bottom: ${(props) => props.theme.spacing(1)};
  padding-left: ${(props) => props.theme.spacing(1)};
  font-family: 'Inter';
  color: ${(props) =>
    props.active ? props.theme.text100 : props.theme.text60};
  border-radius: 4px;
  :hover {
    background: rgba(0, 0, 0, 0.04);
    color: ${(props) => props.theme.text100};
  }
  margin-bottom: calc(${(props) => props.theme.spacing(1)} / 2);
`;

const StyledItemLabel = styled.div`
  display: flex;
  margin-left: ${(props) => props.theme.spacing(2)};
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
      {icon}
      <StyledItemLabel>{label}</StyledItemLabel>
    </StyledItem>
  );
}

export default NavItem;
