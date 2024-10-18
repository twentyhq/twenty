import { NavigationDrawerItemBreadcrumb } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemBreadcrumb';
import { NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import isPropValid from '@emotion/is-prop-valid';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { Link, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import {
  IconComponent,
  MOBILE_VIEWPORT,
  Pill,
  TablerIconsProps,
} from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { NAV_DRAWER_WIDTHS } from '@/ui/navigation/navigation-drawer/constants/NavDrawerWidths';

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
> & { isNavigationDrawerExpanded: boolean };

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
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};

  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(1)};

  margin-top: ${({ indentationLevel }) =>
    indentationLevel === 2 ? '2px' : '0'};

  pointer-events: ${(props) => (props.soon ? 'none' : 'auto')};

  width: ${(props) =>
    !props.isNavigationDrawerExpanded
      ? `${NAV_DRAWER_WIDTHS.menu.desktop.collapsed - 24}px`
      : '100%'};

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

const StyledItemElementsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledItemLabel = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
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
  const isSettingsPage = useIsSettingsPage();
  const navigate = useNavigate();
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useRecoilState(isNavigationDrawerExpandedState);
  const showBreadcrumb = indentationLevel === 2;

  const handleItemClick = () => {
    if (isMobile) {
      setIsNavigationDrawerExpanded(false);
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
        isNavigationDrawerExpanded={isNavigationDrawerExpanded}
      >
        {showBreadcrumb && (
          <NavigationDrawerAnimatedCollapseWrapper>
            <NavigationDrawerItemBreadcrumb state={subItemState} />
          </NavigationDrawerAnimatedCollapseWrapper>
        )}
        <StyledItemElementsContainer>
          {Icon && (
            <Icon
              style={{ minWidth: theme.icon.size.md }}
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.md}
              color={
                showBreadcrumb && !isSettingsPage && !isNavigationDrawerExpanded
                  ? theme.font.color.light
                  : 'currentColor'
              }
            />
          )}

          <NavigationDrawerAnimatedCollapseWrapper>
            <StyledItemLabel>{label}</StyledItemLabel>
          </NavigationDrawerAnimatedCollapseWrapper>

          {soon && (
            <NavigationDrawerAnimatedCollapseWrapper>
              <Pill label="Soon" />
            </NavigationDrawerAnimatedCollapseWrapper>
          )}

          {!!count && (
            <NavigationDrawerAnimatedCollapseWrapper>
              <StyledItemCount>{count}</StyledItemCount>
            </NavigationDrawerAnimatedCollapseWrapper>
          )}

          {keyboard && (
            <NavigationDrawerAnimatedCollapseWrapper>
              <StyledKeyBoardShortcut className="keyboard-shortcuts">
                {keyboard}
              </StyledKeyBoardShortcut>
            </NavigationDrawerAnimatedCollapseWrapper>
          )}
        </StyledItemElementsContainer>
      </StyledItem>
    </StyledNavigationDrawerItemContainer>
  );
};
