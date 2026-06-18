import { SIDE_PANEL_TOP_BAR_HEIGHT_MOBILE } from '@/side-panel/constants/SidePanelTopBarHeightMobile';
import { COMMAND_MENU_SIDE_PANEL_PAGES } from '@/side-panel/constants/CommandMenuSidePanelPages';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { PAGE_HEADER_SIDE_PANEL_BUTTON_CLICK_OUTSIDE_ID } from '@/ui/layout/page-header/constants/PageHeaderSidePanelButtonClickOutsideId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { AppTooltip, TooltipDelay, TooltipPosition } from 'twenty-ui/display';
import { AnimatedButton } from 'twenty-ui/input';
import { useIsMobile } from 'twenty-ui/utilities';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledButtonWrapper = styled.div<{ alignToTop: boolean }>`
  align-items: ${({ alignToTop }) => (alignToTop ? 'center' : 'initial')};
  display: ${({ alignToTop }) => (alignToTop ? 'flex' : 'block')};
  height: ${({ alignToTop }) =>
    alignToTop ? `${SIDE_PANEL_TOP_BAR_HEIGHT_MOBILE}px` : 'auto'};
  position: ${({ alignToTop }) => (alignToTop ? 'fixed' : 'static')};
  right: ${({ alignToTop }) =>
    alignToTop ? themeCssVariables.spacing[3] : 'auto'};
  top: ${({ alignToTop }) => (alignToTop ? '0' : 'auto')};
  z-index: ${RootStackingContextZIndices.SidePanelButton};
`;

const StyledTooltipWrapper = styled.div`
  font-size: ${themeCssVariables.font.size.md};
`;

const xPaths = {
  topLeft: `M12 12 L6 6`,
  topRight: `M12 12 L18 6`,
  bottomLeft: `M12 12 L6 18`,
  bottomRight: `M12 12 L18 18`,
};

const AnimatedIcon = ({
  isSidePanelOpened,
}: {
  isSidePanelOpened: boolean;
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={theme.icon.size.sm}
      height={theme.icon.size.sm}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={theme.icon.stroke.md}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <motion.circle
        cx={12}
        cy={12}
        r="1"
        initial={{ opacity: 0 }}
        animate={{
          scale: isSidePanelOpened ? 0 : 1,
          opacity: isSidePanelOpened ? 0 : 1,
        }}
        transition={{
          duration: theme.animation.duration.fast,
        }}
      />

      {Object.values(xPaths).map((path, index) => (
        <motion.path
          key={index}
          d={path}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: isSidePanelOpened ? 1 : 0,
            opacity: isSidePanelOpened ? 1 : 0,
          }}
          transition={{
            duration: theme.animation.duration.fast,
            ease: 'easeInOut',
            delay: isSidePanelOpened ? 0.1 : 0,
          }}
        />
      ))}

      <motion.circle
        cx="12"
        cy="5"
        r="1"
        initial={{ opacity: 0 }}
        animate={{
          scale: isSidePanelOpened ? 0 : 1,
          opacity: isSidePanelOpened ? 0 : 1,
        }}
        transition={{
          duration: theme.animation.duration.fast,
        }}
      />

      <motion.circle
        cx="12"
        cy="19"
        r="1"
        initial={{ opacity: 0 }}
        animate={{
          scale: isSidePanelOpened ? 0 : 1,
          opacity: isSidePanelOpened ? 0 : 1,
        }}
        transition={{
          duration: theme.animation.duration.fast,
        }}
      />
    </svg>
  );
};

export const SidePanelToggleButton = () => {
  const { openSidePanelMenu } = useSidePanelMenu();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const isMobile = useIsMobile();

  const isCommandMenuOpened =
    isSidePanelOpened && COMMAND_MENU_SIDE_PANEL_PAGES.includes(sidePanelPage);

  const { theme } = useContext(ThemeContext);

  const showAsOpen = false;

  const alignWithSidePanelTopBar =
    isMobile && isLayoutCustomizationModeEnabled && isSidePanelOpened;

  const hasCommandMenuPageInNavigationStack = sidePanelNavigationStack.some(
    ({ page }) => COMMAND_MENU_SIDE_PANEL_PAGES.includes(page),
  );

  const shouldHideButton =
    isCommandMenuOpened ||
    (isSidePanelOpened && hasCommandMenuPageInNavigationStack);

  if (shouldHideButton) {
    return null;
  }

  const ariaLabel = t`Command Menu`;

  return (
    <StyledButtonWrapper alignToTop={alignWithSidePanelTopBar}>
      <div id="toggle-side-panel-button">
        <AnimatedButton
          animatedSvg={<AnimatedIcon isSidePanelOpened={showAsOpen} />}
          dataClickOutsideId={PAGE_HEADER_SIDE_PANEL_BUTTON_CLICK_OUTSIDE_ID}
          dataTestId="page-header-side-panel-button"
          size={isMobile ? 'medium' : 'small'}
          square
          variant="secondary"
          accent="default"
          ariaLabel={ariaLabel}
          onClick={openSidePanelMenu}
          animate={{
            rotate: showAsOpen ? 90 : 0,
          }}
          transition={{
            duration: theme.animation.duration.normal,
            ease: 'easeInOut',
          }}
        />
      </div>

      <StyledTooltipWrapper>
        <AppTooltip
          anchorSelect="#toggle-side-panel-button"
          content={ariaLabel}
          delay={TooltipDelay.longDelay}
          place={TooltipPosition.Bottom}
          offset={5}
          noArrow
        />
      </StyledTooltipWrapper>
    </StyledButtonWrapper>
  );
};
