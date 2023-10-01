import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { IconComponent } from '@/ui/icon/types/IconComponent';
import { MOBILE_VIEWPORT } from '@/ui/theme/constants/theme';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { isNavbarOpenedState } from '../../layout/states/isNavbarOpenedState';

type NavItemProps = {
  label: string;
  to?: string;
  onClick?: () => void;
  Icon: IconComponent;
  active?: boolean;
  danger?: boolean;
  soon?: boolean;
  count?: number;
  keyboard?: string[];
};

type StyledItemProps = {
  active?: boolean;
  danger?: boolean;
  soon?: boolean;
};

const StyledItem = styled.button<StyledItemProps>`
  align-items: center;
  background: ${(props) =>
    props.active ? props.theme.background.transparent.light : 'inherit'};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${(props) => {
    if (props.active) {
      return props.theme.font.color.primary;
    }
    if (props.danger) {
      return props.theme.color.red;
    }
    if (props.soon) {
      return props.theme.font.color.light;
    }
    return props.theme.font.color.secondary;
  }};
  cursor: ${(props) => (props.soon ? 'default' : 'pointer')};
  display: flex;
  font-family: 'Inter';
  font-size: ${({ theme }) => theme.font.size.md};
  margin-bottom: calc(${({ theme }) => theme.spacing(1)} / 2);
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  pointer-events: ${(props) => (props.soon ? 'none' : 'auto')};
  :hover {
    background: ${({ theme }) => theme.background.transparent.light};
    color: ${(props) =>
      props.danger ? props.theme.color.red : props.theme.font.color.primary};
  }
  :hover .keyboard-shortcuts {
    visibility: visible;
  }
  user-select: none;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    font-size: ${({ theme }) => theme.font.size.lg};
  }
`;

const StyledItemLabel = styled.div`
  display: flex;
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledSoonPill = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.light};
  border-radius: 50px;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  height: 16px;
  justify-content: center;
  margin-left: auto;
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledItemCount = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.rounded};
  color: ${({ theme }) => theme.grayScale.gray0};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};

  height: 16px;
  justify-content: center;
  margin-left: auto;
  width: 16px;
`;

const StyledKeyBoardShortcut = styled.div`
  align-items: center;
  border-radius: 4px;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  justify-content: center;
  letter-spacing: 1px;
  margin-left: auto;
  visibility: hidden;
`;

const NavItem = ({
  label,
  Icon,
  to,
  onClick,
  active,
  danger,
  soon,
  count,
  keyboard,
}: NavItemProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [, setIsNavbarOpened] = useRecoilState(isNavbarOpenedState);

  const isMobile = useIsMobile();

  const handleItemClick = () => {
    if (isMobile) {
      setIsNavbarOpened(false);
    }

    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <StyledItem
      onClick={handleItemClick}
      active={active}
      aria-selected={active}
      danger={danger}
      soon={soon}
    >
      {Icon && <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />}
      <StyledItemLabel>{label}</StyledItemLabel>
      {soon && <StyledSoonPill>Soon</StyledSoonPill>}
      {!!count && <StyledItemCount>{count}</StyledItemCount>}
      {keyboard && (
        <StyledKeyBoardShortcut className="keyboard-shortcuts">
          {keyboard.map((key) => key)}
        </StyledKeyBoardShortcut>
      )}
    </StyledItem>
  );
};

export default NavItem;
