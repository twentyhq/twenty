import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { PAGE_HEADER_SIDE_PANEL_BUTTON_CLICK_OUTSIDE_ID } from '@/ui/layout/page-header/constants/PageHeaderSidePanelButtonClickOutsideId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  AppTooltip,
  IconLayoutSidebarRightExpand,
  IconX,
  TooltipDelay,
  TooltipPosition,
} from 'twenty-ui/display';
import { AnimatedButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { AnimatedIconCrossfade, useIsMobile } from 'twenty-ui/utilities';

const StyledTooltipWrapper = styled.div`
  font-size: ${themeCssVariables.font.size.md};
`;

export const CommandMenuItemMoreActionsButton = () => {
  const { toggleSidePanelMenu } = useSidePanelMenu();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);

  const isMobile = useIsMobile();

  const ariaLabel = isSidePanelOpened
    ? t`Close side panel`
    : t`Open side panel`;

  return (
    <div id="toggle-side-panel-button">
      <AnimatedButton
        animatedSvg={
          <AnimatedIconCrossfade
            isActive={isSidePanelOpened}
            ActiveIcon={IconX}
            InactiveIcon={IconLayoutSidebarRightExpand}
          />
        }
        dataClickOutsideId={PAGE_HEADER_SIDE_PANEL_BUTTON_CLICK_OUTSIDE_ID}
        dataTestId="page-header-side-panel-button"
        size={isMobile ? 'medium' : 'small'}
        variant="secondary"
        accent="default"
        title={t`More`}
        ariaLabel={ariaLabel}
        onClick={toggleSidePanelMenu}
      />
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
    </div>
  );
};
