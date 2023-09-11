import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { IconComponent } from '@/ui/icon/types/IconComponent';
import {
  StyledItem,
  StyledItemLabel,
} from '@/ui/navbar/components/StyledNavItem';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { isNavbarOpenedState } from '../../layout/states/isNavbarOpenedState';

export type NavItemProps = {
  label: string;
  to?: string;
  onClick?: () => void;
  Icon: IconComponent;
  active?: boolean;
  danger?: boolean;
  soon?: boolean;
};

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

function NavItem({
  label,
  Icon,
  to,
  onClick,
  active,
  danger,
  soon,
}: NavItemProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [, setIsNavbarOpened] = useRecoilState(isNavbarOpenedState);

  const isMobile = useIsMobile();

  function handleItemClick() {
    if (isMobile) {
      setIsNavbarOpened(false);
    }

    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  }

  return (
    <StyledItem
      onClick={handleItemClick}
      active={active}
      aria-selected={active}
      danger={danger}
      soon={soon}
    >
      {Icon && <Icon size={theme.icon.size.md} />}
      <StyledItemLabel>{label}</StyledItemLabel>
      {soon && <StyledSoonPill>Soon</StyledSoonPill>}
    </StyledItem>
  );
}

export default NavItem;
