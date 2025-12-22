import { t } from '@lingui/core/macro';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItemBreadcrumb } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemBreadcrumb';
import { NAVIGATION_DRAWER_COLLAPSED_WIDTH } from '@/ui/layout/resizable-panel/constants/NavigationDrawerCollapsedWidth';
import { useNavigationDrawerTooltip } from '@/ui/navigation/navigation-drawer/hooks/useNavigationDrawerTooltip';
import { type NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import isPropValid from '@emotion/is-prop-valid';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { Pill } from 'twenty-ui/components';
import {
  AppTooltip,
  type IconComponent,
  Label,
  OverflowingTextWithTooltip,
  type TablerIconsProps,
  TooltipDelay,
  TooltipPosition,
} from 'twenty-ui/display';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import {
  type TriggerEventType,
  useMouseDownNavigation,
} from 'twenty-ui/utilities';

const DEFAULT_INDENTATION_LEVEL = 1;

export type NavigationDrawerItemIndentationLevel = 1 | 2;

export type NavigationDrawerItemProps = {
  className?: string;
  label: string;
  secondaryLabel?: string;
  indentationLevel?: NavigationDrawerItemIndentationLevel;
  subItemState?: NavigationDrawerSubItemState;
  to?: string;
  onClick?: () => void;
  Icon?: IconComponent | ((props: TablerIconsProps) => JSX.Element);
  active?: boolean;
  danger?: boolean;
  soon?: boolean;
  isNew?: boolean;
  count?: number;
  keyboard?: string[];
  rightOptions?: ReactNode;
  isDragging?: boolean;
  isRightOptionsDropdownOpen?: boolean;
  triggerEvent?: TriggerEventType;
  mouseUpNavigation?: boolean;
  preventCollapseOnMobile?: boolean;
};

type StyledItemProps = Pick<
  NavigationDrawerItemProps,
  'active' | 'danger' | 'indentationLevel' | 'soon' | 'to' | 'isDragging'
> & { isNavigationDrawerExpanded: boolean; hasRightOptions: boolean };

const StyledItem = styled('button', {
  shouldForwardProp: (prop) =>
    !['active', 'danger', 'soon', 'isDragging'].includes(prop) &&
    isPropValid(prop),
})<StyledItemProps>`
  box-sizing: content-box;
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
  padding-right: ${({ theme, hasRightOptions }) =>
    hasRightOptions ? theme.spacing(0.5) : theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(1)};

  margin-top: ${({ indentationLevel }) =>
    indentationLevel === 2 ? '2px' : '0'};

  pointer-events: ${(props) => (props.soon ? 'none' : 'auto')};

  width: ${(props) =>
    !props.isNavigationDrawerExpanded
      ? `calc(${NAVIGATION_DRAWER_COLLAPSED_WIDTH}px - ${props.theme.spacing(6)})`
      : `calc(100% - ${props.theme.spacing(1.5)})`};

  ${({ isDragging }) =>
    isDragging &&
    `
    cursor: grabbing;
  `}

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
  width: 100%;
`;

const StyledLabelParent = styled.div`
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  white-space: nowrap;
  min-width: 0px;
  overflow: hidden;
  text-overflow: clip;
`;

const StyledItemLabel = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledItemSecondaryLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

const StyledItemCount = styled.span`
  align-items: center;
  background-color: ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.rounded};
  color: ${({ theme }) => theme.grayScale.gray1};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  height: 16px;
  justify-content: center;
  margin-left: auto;
  width: 16px;
`;

const StyledKeyBoardShortcut = styled.span`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
  box-sizing: border-box;

  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.strong};
  background: ${({ theme }) => theme.background.transparent.lighter};
`;

const StyledNavigationDrawerItemContainer = styled.div`
  display: flex;
  width: 100%;
`;

const StyledSpacer = styled.span`
  flex-grow: 1;
`;

const StyledIcon = styled.div`
  flex-shrink: 0;
  flex-grow: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledRightOptionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  flex-grow: 0;
  height: ${({ theme }) => theme.spacing(6)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

const visibleStateStyles = css`
  clip-path: unset;
  display: flex;
  height: unset;
  opacity: 1;
  overflow: unset;
  position: unset;
  width: unset;
`;

const StyledRightOptionsVisbility = styled.div<{
  isMobile: boolean;
  isRightOptionsDropdownOpen?: boolean;
}>`
  display: block;
  opacity: 0;
  transition: opacity 150ms;
  position: absolute;
  padding-left: ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
  clip-path: inset(1px);
  white-space: nowrap;
  height: 1px;
  width: 1px;

  ${({ isMobile, isRightOptionsDropdownOpen }) =>
    (isMobile || isRightOptionsDropdownOpen) && visibleStateStyles}

  .navigation-drawer-item:hover & {
    ${visibleStateStyles}
  }
`;

export const NavigationDrawerItem = ({
  className,
  label,
  secondaryLabel,
  indentationLevel = DEFAULT_INDENTATION_LEVEL,
  Icon,
  to,
  onClick,
  active,
  danger,
  soon,
  isNew,
  count,
  keyboard,
  subItemState,
  rightOptions,
  isDragging,
  isRightOptionsDropdownOpen,
  triggerEvent,
  mouseUpNavigation = false,
  preventCollapseOnMobile = false,
}: NavigationDrawerItemProps) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const isSettingsPage = useIsSettingsPage();
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useRecoilState(isNavigationDrawerExpandedState);

  const { navigationItemId } = useNavigationDrawerTooltip(label, to);

  const showBreadcrumb = indentationLevel === 2;
  const showStyledSpacer = Boolean(
    soon || isNew || count || keyboard || rightOptions,
  );

  const handleMobileNavigation = () => {
    if (isMobile && !preventCollapseOnMobile) {
      setIsNavigationDrawerExpanded(false);
    }
  };

  const {
    onClick: handleMouseDownNavigationClickClick,
    onMouseDown: handleMouseDown,
  } = useMouseDownNavigation({
    to,
    onClick,
    onBeforeNavigation: handleMobileNavigation,
    triggerEvent,
  });

  return (
    <StyledNavigationDrawerItemContainer>
      <StyledItem
        id={navigationItemId}
        className={`navigation-drawer-item ${className || ''}`}
        onClick={
          mouseUpNavigation ? onClick : handleMouseDownNavigationClickClick
        }
        onMouseDown={mouseUpNavigation ? undefined : handleMouseDown}
        active={active}
        aria-selected={active}
        danger={danger}
        soon={soon}
        as={to ? Link : rightOptions ? 'div' : undefined}
        to={to ? to : undefined}
        indentationLevel={indentationLevel}
        isNavigationDrawerExpanded={isNavigationDrawerExpanded}
        isDragging={isDragging}
        hasRightOptions={!!rightOptions}
      >
        <StyledItemElementsContainer>
          {showBreadcrumb && (
            <NavigationDrawerAnimatedCollapseWrapper>
              <NavigationDrawerItemBreadcrumb state={subItemState} />
            </NavigationDrawerAnimatedCollapseWrapper>
          )}

          {Icon && (
            <StyledIcon>
              <Icon
                style={{ minWidth: theme.icon.size.md }}
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.md}
                color={
                  showBreadcrumb &&
                  !isSettingsPage &&
                  !isNavigationDrawerExpanded
                    ? theme.font.color.light
                    : 'currentColor'
                }
              />
            </StyledIcon>
          )}

          <StyledLabelParent>
            <OverflowingTextWithTooltip
              text={
                <>
                  <StyledItemLabel>{label}</StyledItemLabel>
                  {secondaryLabel && (
                    <StyledItemSecondaryLabel>
                      {' · '}
                      {secondaryLabel}
                    </StyledItemSecondaryLabel>
                  )}
                </>
              }
              tooltipContent={
                secondaryLabel ? `${label} · ${secondaryLabel}` : label
              }
            />
          </StyledLabelParent>

          {showStyledSpacer && <StyledSpacer />}

          {soon && (
            <NavigationDrawerAnimatedCollapseWrapper>
              <Pill label={t`Soon`} />
            </NavigationDrawerAnimatedCollapseWrapper>
          )}

          {isNew && (
            <NavigationDrawerAnimatedCollapseWrapper>
              <Pill label={t`New`} />
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
                <Label>{keyboard}</Label>
              </StyledKeyBoardShortcut>
            </NavigationDrawerAnimatedCollapseWrapper>
          )}

          {rightOptions && (
            <NavigationDrawerAnimatedCollapseWrapper>
              <StyledRightOptionsContainer
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <StyledRightOptionsVisbility
                  isMobile={isMobile}
                  isRightOptionsDropdownOpen={
                    isRightOptionsDropdownOpen || false
                  }
                >
                  {rightOptions}
                </StyledRightOptionsVisbility>
              </StyledRightOptionsContainer>
            </NavigationDrawerAnimatedCollapseWrapper>
          )}
        </StyledItemElementsContainer>
      </StyledItem>

      {!isNavigationDrawerExpanded && !isMobile && (
        <AppTooltip
          anchorSelect={`#${navigationItemId}`}
          content={label}
          place={TooltipPosition.Right}
          delay={TooltipDelay.noDelay}
          positionStrategy="fixed"
        />
      )}
    </StyledNavigationDrawerItemContainer>
  );
};
