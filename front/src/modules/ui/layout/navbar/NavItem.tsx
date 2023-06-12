import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { MOBILE_VIEWPORT } from '../styles/themes';

type OwnProps = {
  label: string;
  to: string;
  active?: boolean;
  icon: ReactNode;
  danger?: boolean;
};

type StyledItemProps = {
  active?: boolean;
  danger?: boolean;
};

const StyledItem = styled.button<StyledItemProps>`
  display: flex;
  align-items: center;
  border: none;
  font-size: ${(props) => props.theme.fontSizeMedium};
  cursor: pointer;
  user-select: none;
  background: ${(props) => (props.active ? 'rgba(0, 0, 0, 0.04)' : 'inherit')};
  padding-top: ${(props) => props.theme.spacing(1)};
  padding-bottom: ${(props) => props.theme.spacing(1)};
  padding-left: ${(props) => props.theme.spacing(1)};
  font-family: 'Inter';
  color: ${(props) => {
    if (props.active) {
      return props.theme.text100;
    }
    if (props.danger) {
      return props.theme.red;
    }
    return props.theme.text60;
  }};
  border-radius: 4px;
  :hover {
    background: rgba(0, 0, 0, 0.04);
    color: ${(props) => (props.danger ? props.theme.red : props.theme.text100)};
  }
  margin-bottom: calc(${(props) => props.theme.spacing(1)} / 2);

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    font-size: ${(props) => props.theme.fontSizeLarge};
  }
`;

const StyledItemLabel = styled.div`
  display: flex;
  margin-left: ${(props) => props.theme.spacing(2)};
`;

function NavItem({ label, icon, to, active, danger }: OwnProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <StyledItem
      onClick={() => {
        navigate(to, { state: { from: location } });
      }}
      active={active}
      aria-selected={active}
      danger={danger}
    >
      {icon}
      <StyledItemLabel>{label}</StyledItemLabel>
    </StyledItem>
  );
}

export default NavItem;
