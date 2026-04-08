import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { NAVIGATION_DRAWER_COLLAPSED_WIDTH } from '@/ui/layout/resizable-panel/constants/NavigationDrawerCollapsedWidth';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItemBreadcrumb } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemBreadcrumb';
import { useNavigationDrawerTooltip } from '@/ui/navigation/navigation-drawer/hooks/useNavigationDrawerTooltip';
import { type NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useContext } from 'react';
import { Link } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Pill } from 'twenty-ui/components';
import {
  AppTooltip,
  type IconComponent,
  Label,
  OverflowingTextWithTooltip,
  type TablerIconsProps,
  TintedIconTile,
  TooltipDelay,
  TooltipPosition,
} from 'twenty-ui/display';
import {
  MOBILE_VIEWPORT,
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
import {
  type TriggerEventType,
  useMouseDownNavigation,
} from 'twenty-ui/utilities';
const DEFAULT_INDENTATION_LEVEL = 1;

export type NavigationDrawerItemIndentationLevel = 1 | 2;

export type NavigationDrawerItemModifier =
  | 'soon'
  | 'new'
  | { keyboard: string[] };

export type NavigationDrawerItemProps = {
  className?: string;
  label: string;
  secondaryLabel?: string;
  indentationLevel?: NavigationDrawerItemIndentationLevel;
  subItemState?: NavigationDrawerSubItemState;
  to?: string;
  onClick?: () => void;
  Icon?: IconComponent | ((props: TablerIconsProps) => JSX.Element);
  iconColor?: string | null;
  active?: boolean;
  modifier?: NavigationDrawerItemModifier;
  rightOptions?: ReactNode;
  alwaysShowRightOptions?: boolean;
  isDragging?: boolean;
  isRightOptionsDropdownOpen?: boolean;
  triggerEvent?: TriggerEventType;
  preventCollapseOnMobile?: boolean;
  isSelectedInEditMode?: boolean;
  variant?: 'default' | 'tertiary';
};

type StyledItemProps = Pick<
  NavigationDrawerItemProps,
  | 'active'
  | 'indentationLevel'
  | 'to'
  | 'isDragging'
  | 'isSelectedInEditMode'
  | 'variant'
> & {
  isSoon: boolean;
  isNavigationDrawerExpanded: boolean;
  hasRightOptions: boolean;
  href?: string;
  target?: string;
  rel?: string;
};

const StyledItem = styled.button<StyledItemProps>`
  align-items: center;
  background: ${({ active }) =>
    active ? themeCssVariables.background.transparent.light : 'transparent'};
  border: ${({ isSelectedInEditMode }) =>
    isSelectedInEditMode
      ? `1px solid ${themeCssVariables.color.blue}`
      : '1px solid transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${({ active, isSoon, variant }) => {
    if (active === true) {
      return themeCssVariables.font.color.primary;
    }
    if (isSoon) {
      return themeCssVariables.font.color.light;
    }
    if (variant === 'tertiary') {
      return themeCssVariables.font.color.tertiary;
    }
    return themeCssVariables.font.color.secondary;
  }};
  cursor: ${({ isSoon, isDragging }) =>
    isDragging ? 'grabbing' : isSoon ? 'default' : 'pointer'};
  display: flex;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  height: ${themeCssVariables.spacing[7]};
  margin-top: ${({ indentationLevel }) =>
    indentationLevel === 2 ? '2px' : '0'};
  min-width: 0;
  padding-bottom: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[1]};
  padding-right: ${({ hasRightOptions }) =>
    hasRightOptions
      ? themeCssVariables.spacing['0.5']
      : themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[1]};
  pointer-events: ${({ isSoon }) => (isSoon ? 'none' : 'auto')};
  text-decoration: none;
  user-select: none;
  width: ${({ isNavigationDrawerExpanded, hasRightOptions }) =>
    !isNavigationDrawerExpanded
      ? `calc(${NAVIGATION_DRAWER_COLLAPSED_WIDTH}px - ${themeCssVariables.spacing[6]} + ${themeCssVariables.spacing[1]} + ${hasRightOptions ? themeCssVariables.spacing['0.5'] : themeCssVariables.spacing[1]})`
      : `calc(100% - ${themeCssVariables.spacing['1.5']} + ${themeCssVariables.spacing[1]} + ${hasRightOptions ? themeCssVariables.spacing['0.5'] : themeCssVariables.spacing[1]})`};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    color: ${themeCssVariables.font.color.primary};
  }

  &:hover .keyboard-shortcuts {
    visibility: visible;
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    font-size: ${themeCssVariables.font.size.lg};
  }
`;

const StyledItemElementsContainer = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
`;

const StyledLabelParent = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  min-width: 0px;
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
`;

const StyledItemLabel = styled.span`
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledItemSecondaryLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledKeyBoardShortcut = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};

  height: ${themeCssVariables.spacing[4]};
  justify-content: center;
  width: ${themeCssVariables.spacing[4]};
`;

const StyledNavigationDrawerItemContainer = styled.div`
  display: flex;
  width: 100%;
`;

const StyledSpacer = styled.span`
  flex-grow: 1;
`;

const StyledIcon = styled.div<{
  $backgroundColor?: string;
  $borderColor?: string;
}>`
  align-items: center;
  background-color: ${({ $backgroundColor }) =>
    $backgroundColor || 'transparent'};
  border: ${({ $backgroundColor, $borderColor }) =>
    $backgroundColor && $borderColor ? `1px solid ${$borderColor}` : 'none'};
  border-radius: ${({ $backgroundColor }) => ($backgroundColor ? '4px' : '0')};
  box-sizing: ${({ $backgroundColor }) =>
    $backgroundColor ? 'border-box' : 'content-box'};
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  height: ${({ $backgroundColor }) =>
    $backgroundColor ? themeCssVariables.spacing[4] : 'auto'};
  justify-content: center;
  margin-right: ${themeCssVariables.spacing[2]};
  width: ${({ $backgroundColor }) =>
    $backgroundColor ? themeCssVariables.spacing[4] : 'auto'};
`;

const StyledRightOptionsContainer = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[6]};
  justify-content: center;
`;

const StyledRightOptionsVisbility = styled.div`
  clip-path: inset(1px);
  display: block;
  height: 1px;
  opacity: 0;
  overflow: hidden;
  padding-left: ${themeCssVariables.spacing[2]};
  position: absolute;
  transition: opacity 150ms;
  white-space: nowrap;
  width: 1px;

  &[data-visible='true'],
  .navigation-drawer-item:hover & {
    clip-path: unset;
    display: flex;
    height: unset;
    opacity: 1;
    overflow: unset;
    position: unset;
    width: unset;
  }
`;

export const NavigationDrawerItem = ({
  className,
  label,
  secondaryLabel,
  indentationLevel = DEFAULT_INDENTATION_LEVEL,
  Icon,
  iconColor,
  to,
  onClick,
  active,
  modifier,
  subItemState,
  rightOptions,
  alwaysShowRightOptions = false,
  isDragging,
  isRightOptionsDropdownOpen,
  triggerEvent,
  preventCollapseOnMobile = false,
  isSelectedInEditMode = false,
  variant = 'default',
}: NavigationDrawerItemProps) => {
  const { theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const isSettingsPage = useIsSettingsPage();
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useAtomState(isNavigationDrawerExpandedState);

  const { navigationItemId } = useNavigationDrawerTooltip(label, to);

  const isSoon = modifier === 'soon';
  const isNew = modifier === 'new';
  const keyboardKeys =
    isDefined(modifier) && typeof modifier === 'object'
      ? modifier.keyboard
      : undefined;

  const showBreadcrumb = indentationLevel === 2;
  const showStyledSpacer = isDefined(modifier) || isDefined(rightOptions);

  const handleMobileNavigation = () => {
    if (isMobile && !preventCollapseOnMobile) {
      setIsNavigationDrawerExpanded(false);
    }
  };

  const isExternalLink =
    isDefined(to) && (to.startsWith('http://') || to.startsWith('https://'));
  const isInternalLink = isDefined(to) && !isExternalLink;

  const handleExternalLinkClick = () => {
    handleMobileNavigation();
    if (isDefined(to)) {
      window.open(to, '_blank', 'noopener,noreferrer');
    }
  };

  const {
    onClick: handleMouseDownNavigationClickClick,
    onMouseDown: handleMouseDown,
  } = useMouseDownNavigation({
    to: isExternalLink ? undefined : to,
    onClick: isExternalLink ? (onClick ?? handleExternalLinkClick) : onClick,
    onBeforeNavigation: handleMobileNavigation,
    triggerEvent,
  });

  const elementType = isExternalLink
    ? 'a'
    : isInternalLink
      ? Link
      : isDefined(rightOptions)
        ? 'div'
        : undefined;

  return (
    <StyledNavigationDrawerItemContainer>
      <StyledItem
        id={navigationItemId}
        className={`navigation-drawer-item ${className || ''}`}
        onClick={handleMouseDownNavigationClickClick}
        onMouseDown={handleMouseDown}
        active={active}
        aria-selected={active}
        isSoon={isSoon}
        variant={variant}
        indentationLevel={indentationLevel}
        isNavigationDrawerExpanded={isNavigationDrawerExpanded}
        isDragging={isDragging}
        hasRightOptions={isDefined(rightOptions)}
        isSelectedInEditMode={isSelectedInEditMode}
        as={elementType}
        role={!to && isDefined(rightOptions) ? 'button' : undefined}
        to={isInternalLink ? to : undefined}
        href={isExternalLink ? to : undefined}
        target={isExternalLink ? '_blank' : undefined}
        rel={isExternalLink ? 'noopener noreferrer' : undefined}
        draggable={isInternalLink ? false : undefined}
      >
        <StyledItemElementsContainer>
          {showBreadcrumb && (
            <NavigationDrawerAnimatedCollapseWrapper>
              <NavigationDrawerItemBreadcrumb state={subItemState} />
            </NavigationDrawerAnimatedCollapseWrapper>
          )}

          {Icon &&
            (isNonEmptyString(iconColor) ? (
              <StyledIcon>
                <TintedIconTile Icon={Icon} color={iconColor} />
              </StyledIcon>
            ) : (
              <StyledIcon>
                <Icon
                  style={{
                    minWidth: theme.icon.size.md,
                  }}
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
            ))}

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

          {isSoon && (
            <NavigationDrawerAnimatedCollapseWrapper>
              <Pill label={t`Soon`} />
            </NavigationDrawerAnimatedCollapseWrapper>
          )}

          {isNew && (
            <NavigationDrawerAnimatedCollapseWrapper>
              <Pill label={t`New`} />
            </NavigationDrawerAnimatedCollapseWrapper>
          )}

          {isDefined(keyboardKeys) && (
            <NavigationDrawerAnimatedCollapseWrapper>
              <StyledKeyBoardShortcut className="keyboard-shortcuts">
                <Label>{keyboardKeys}</Label>
              </StyledKeyBoardShortcut>
            </NavigationDrawerAnimatedCollapseWrapper>
          )}

          {isDefined(rightOptions) && (
            <NavigationDrawerAnimatedCollapseWrapper>
              {/* When StyledItem renders as a Link, we need both handlers to
                  prevent navigation when interacting with rightOptions:
                  - onMouseDown: stops useMouseDownNavigation from calling navigate()
                  - onClickCapture: prevents the native <a> follow since the child's
                    stopPropagation blocks Link's own preventDefault */}
              <StyledRightOptionsContainer
                onMouseDown={(e) => e.stopPropagation()}
                onClickCapture={(e) => e.preventDefault()}
              >
                <StyledRightOptionsVisbility
                  data-visible={
                    isMobile ||
                    isRightOptionsDropdownOpen ||
                    alwaysShowRightOptions
                      ? 'true'
                      : undefined
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
