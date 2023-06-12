import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { logout } from '../../../auth/services/AuthService';
import { MOBILE_VIEWPORT } from '../styles/themes';

type OwnProps = {
  label: string;
  to: string;
  active?: boolean;
  icon: ReactNode;
  danger?: boolean;
  soon?: boolean;
};

type StyledItemProps = {
  active?: boolean;
  danger?: boolean;
  soon?: boolean;
};

const StyledItem = styled.button<StyledItemProps>`
  display: flex;
  align-items: center;
  border: none;
  font-size: ${(props) => props.theme.fontSizeMedium};
  cursor: ${(props) => (props.soon ? 'default' : 'pointer')};
  pointer-events: ${(props) => (props.soon ? 'none' : 'auto')};
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
    if (props.soon) {
      return props.theme.text20;
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

const StyledSoonPill = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50px;
  background-color: rgba(0, 0, 0, 0.04);
  font-size: ${(props) => props.theme.fontSizeExtraSmall};
  padding: ${(props) => props.theme.spacing(1)}
    ${(props) => props.theme.spacing(2)} ${(props) => props.theme.spacing(1)}
    ${(props) => props.theme.spacing(2)};
  margin-left: auto; // this aligns the pill to the right
`;

function NavItem({ label, icon, to, active, danger, soon }: OwnProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = () => {
    if (to === '/logout') {
      logout();
      navigate('/');
    } else if (to === '/settings') {
      navigate(to, { state: { from: location } });
    } else {
      navigate(to);
    }
  };

  return (
    <StyledItem
      onClick={handleNavigation}
      active={active}
      aria-selected={active}
      danger={danger}
      soon={soon}
    >
      {icon}
      <StyledItemLabel>{label}</StyledItemLabel>
      {soon && <StyledSoonPill>Soon</StyledSoonPill>}
    </StyledItem>
  );
}

export default NavItem;
