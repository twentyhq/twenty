import { FrontComponentMediaSessionIndicator } from '@/front-components/media-session/components/FrontComponentMediaSessionIndicator';
import { APP_HEADER_HEIGHT } from '@/ui/layout/constants/AppHeaderHeight';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconTool } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';
import { PermissionFlagType } from '~/generated-metadata/graphql';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { preloadNavigationMenuItemDndKit } from '@/navigation-menu-item/display/dnd/preloadNavigationMenuItemDndKit';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NAVIGATION_DRAWER_CLICK_OUTSIDE_ID } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerClickOutsideId';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { MultiWorkspaceDropdownButton } from '@/navigation/components/MultiWorkspaceDropdown/MultiWorkspaceDropdownButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsMobile } from 'twenty-ui/utilities';
import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';

const StyledContainer = styled.div`
  flex-shrink: 0;
  user-select: none;
`;

const StyledHeaderRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  height: ${APP_HEADER_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[2]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: 0 ${themeCssVariables.spacing[7]};
  }
`;

const StyledCollapsedActions = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]}
    ${themeCssVariables.spacing[1]};
`;

const StyledShownOnDrawerHover = styled.div`
  display: flex;
  opacity: 0;
  transition: opacity calc(${themeCssVariables.animation.duration.fast} * 1s);

  [data-click-outside-id='${NAVIGATION_DRAWER_CLICK_OUTSIDE_ID}']:hover &,
  &:focus-within {
    opacity: 1;
  }
`;

const StyledRightActions = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing['0.5']};
  margin-left: auto;
`;

const StyledWorkspaceDropdownContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
`;

export const NavigationDrawerHeader = () => {
  const isMobile = useIsMobile();
  const isExpanded = useIsNavigationDrawerContentExpanded();
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();

  const editNavigationButton = !isMobile &&
    hasLayoutsPermission &&
    !isLayoutCustomizationModeEnabled && (
      <StyledShownOnDrawerHover onMouseEnter={preloadNavigationMenuItemDndKit}>
        <LightIconButton
          emphasis="standard"
          size={isExpanded ? 'sm' : 'md'}
          onClick={enterLayoutCustomizationMode}
          aria-label={t`Edit navigation`}
        >
          <IconTool />
        </LightIconButton>
      </StyledShownOnDrawerHover>
    );

  return (
    <StyledContainer>
      <StyledHeaderRow>
        <StyledWorkspaceDropdownContainer>
          <MultiWorkspaceDropdownButton />
        </StyledWorkspaceDropdownContainer>
        {isExpanded && (
          <StyledRightActions>
            <FrontComponentMediaSessionIndicator />
            {editNavigationButton}
            <NavigationDrawerCollapseButton
              direction="left"
              size={isMobile ? 'md' : 'sm'}
            />
          </StyledRightActions>
        )}
      </StyledHeaderRow>
      {!isExpanded && !isMobile && (
        <StyledCollapsedActions>
          <FrontComponentMediaSessionIndicator />
          {editNavigationButton}
        </StyledCollapsedActions>
      )}
    </StyledContainer>
  );
};
