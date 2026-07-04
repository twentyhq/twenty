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
import { IconDotsVertical } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { AppTooltip, TooltipDelay, TooltipPosition } from 'twenty-ui/surfaces';
import { getOsControlSymbol, useIsMobile } from 'twenty-ui/utilities';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
  const tooltipContent = t`Command menu | ${getOsControlSymbol()}K`;

  return (
    <StyledButtonWrapper alignToTop={alignWithSidePanelTopBar}>
      <div
        id="toggle-side-panel-button"
        data-click-outside-id={PAGE_HEADER_SIDE_PANEL_BUTTON_CLICK_OUTSIDE_ID}
      >
        <IconButton
          Icon={IconDotsVertical}
          dataTestId="page-header-side-panel-button"
          size={isMobile ? 'medium' : 'small'}
          variant="primary"
          accent="default"
          ariaLabel={ariaLabel}
          onClick={openSidePanelMenu}
        />
      </div>

      <StyledTooltipWrapper>
        <AppTooltip
          anchorSelect="#toggle-side-panel-button"
          content={tooltipContent}
          delay={TooltipDelay.longDelay}
          place={TooltipPosition.Bottom}
          offset={5}
          noArrow
        />
      </StyledTooltipWrapper>
    </StyledButtonWrapper>
  );
};
