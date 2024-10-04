import { NavigationDrawerItemBreadcrumb } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemBreadcrumb';
import { NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';
import { isNavigationDrawerOpenState } from '@/ui/navigation/states/isNavigationDrawerOpenState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import isPropValid from '@emotion/is-prop-valid';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { Link, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import {
  IconComponent,
  MOBILE_VIEWPORT,
  Pill,
  TablerIconsProps,
} from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';

const DEFAULT_INDENTATION_LEVEL = 1;

export type NavigationDrawerItemIndentationLevel = 1 | 2;

export type NavigationDrawerItemProps = {
  className?: string;
  label: string;
  indentationLevel?: NavigationDrawerItemIndentationLevel;
  subItemState?: NavigationDrawerSubItemState;
  to?: string;
  onClick?: () => void;
  Icon: IconComponent | ((props: TablerIconsProps) => JSX.Element);
  active?: boolean;
  danger?: boolean;
  soon?: boolean;
  count?: number;
  keyboard?: string[];
};

type StyledItemProps = Pick<
  NavigationDrawerItemProps,
  'active' | 'danger' | 'indentationLevel' | 'soon' | 'to'
>;

const StyledItem = styled('div', {
  shouldForwardProp: (prop) =>
    !['active', 'danger', 'soon'].includes(prop) && isPropValid(prop),
})<StyledItemProps>`
  align-items: center;
  background: ${(props) =>
    props.active ? props.theme.background.transparent.light : 'inherit'};
  height: ${({ theme }) => theme.spacing(5)};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  text-decoration: none;
  color: ${(props) => {
    if (props.active === true) {
      return props.theme.font.color.primary;
    }
    if (props.danger === true) {
      return props.theme.color.red;
    }
    if (props.soon === true) {
      return props.theme.font.color.light;
    }
    return props.theme.font.color.secondary;
  }};
  cursor: ${(props) => (props.soon ? 'default' : 'pointer')};
  display: flex;
  font-family: 'Inter';
  font-size: ${({ theme }) => theme.font.size.md};
  gap: ${({ theme }) => theme.spacing(2)};

  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(1)};

  margin-top: ${({ indentationLevel }) =>
    indentationLevel === 2 ? '2px' : '0'};

  pointer-events: ${(props) => (props.soon ? 'none' : 'auto')};
  width: 100%;
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
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const StyledNavigationDrawerItemContainer = styled.div`
  display: flex;
  flex-grow: 1;
  width: 100%;
`;

export const NavigationDrawerItem = ({
  className,
  label,
  indentationLevel = DEFAULT_INDENTATION_LEVEL,
  Icon,
  to,
  onClick,
  active,
  danger,
  soon,
  count,
  keyboard,
  subItemState,
}: NavigationDrawerItemProps) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const setIsNavigationDrawerOpen = useSetRecoilState(
    isNavigationDrawerOpenState,
  );

  const showBreadcrumb = indentationLevel === 2;

  const handleItemClick = () => {
    if (isMobile) {
      setIsNavigationDrawerOpen(false);
    }

    if (isDefined(onClick)) {
      onClick();
      return;
    }

    if (isNonEmptyString(to)) {
      navigate(to);
    }
  };

  return (
    <StyledNavigationDrawerItemContainer>
      <StyledItem
        className={className}
        onClick={handleItemClick}
        active={active}
        aria-selected={active}
        danger={danger}
        soon={soon}
        as={to ? Link : 'div'}
        to={to ? to : undefined}
        indentationLevel={indentationLevel}
      >
        {showBreadcrumb && (
          <NavigationDrawerItemBreadcrumb state={subItemState} />
        )}
        {Icon && (
          <Icon
            style={{ minWidth: theme.icon.size.md }}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.md}
          />
        )}
        <StyledItemLabel>{label}</StyledItemLabel>
        {soon && <Pill label="Soon" />}
        {!!count && <StyledItemCount>{count}</StyledItemCount>}
        {keyboard && (
          <StyledKeyBoardShortcut className="keyboard-shortcuts">
            {keyboard}
          </StyledKeyBoardShortcut>
        )}
      </StyledItem>
    </StyledNavigationDrawerItemContainer>
  );
};
