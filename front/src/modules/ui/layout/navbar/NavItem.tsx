import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { MOBILE_VIEWPORT } from '../styles/themes';

type OwnProps = {
  label: string;
  to?: string;
  onClick?: () => void;
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
  align-items: center;
  background: ${(props) =>
    props.active ? props.theme.lightBackgroundTransparent : 'inherit'};
  border: none;
  border-radius: 4px;
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
  cursor: ${(props) => (props.soon ? 'default' : 'pointer')};
  display: flex;
  font-family: 'Inter';
  font-size: ${(props) => props.theme.fontSizeMedium};
  margin-bottom: calc(${(props) => props.theme.spacing(1)} / 2);
  padding-bottom: ${(props) => props.theme.spacing(1)};
  padding-left: ${(props) => props.theme.spacing(1)};
  padding-top: ${(props) => props.theme.spacing(1)};
  pointer-events: ${(props) => (props.soon ? 'none' : 'auto')};
  :hover {
    background: ${(props) => props.theme.lightBackgroundTransparent};
    color: ${(props) => (props.danger ? props.theme.red : props.theme.text100)};
  }
  user-select: none;

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
  background-color: ${(props) => props.theme.lightBackgroundTransparent};
  font-size: ${(props) => props.theme.fontSizeExtraSmall};
  padding: ${(props) => props.theme.spacing(1)}
    ${(props) => props.theme.spacing(2)} ${(props) => props.theme.spacing(1)}
    ${(props) => props.theme.spacing(2)};
  margin-left: auto; // this aligns the pill to the right
`;

function NavItem({ label, icon, to, onClick, active, danger, soon }: OwnProps) {
  const navigate = useNavigate();

  const onItemClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (to) {
      navigate(to);
      return;
    }
  };

  return (
    <StyledItem
      onClick={onItemClick}
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
