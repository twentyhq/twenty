import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconTool } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { preloadNavigationMenuItemDndKit } from '@/navigation-menu-item/display/dnd/preloadNavigationMenuItemDndKit';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { useEditModeNavigationMenuItemClick } from '@/navigation-menu-item/edit/hooks/useEditModeNavigationMenuItemClick';
import { WorkspaceSectionContainer } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionContainer';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { WorkspaceSectionHeaderAddDropdown } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionHeaderAddDropdown';

import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { doNotTranslate } from 'twenty-shared/i18n';

const StyledRightIconsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const WorkspaceSection = () => {
  const isMobile = useIsMobile();
  const items = useNavigationMenuItemSectionItems();
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const [
    selectedNavigationMenuItemIdInEditMode,
    setSelectedNavigationMenuItemIdInEditMode,
  ] = useAtomState(selectedNavigationMenuItemIdInEditModeState);
  const { openNavigationSection } = useNavigationSection(
    doNotTranslate('Workspace'),
  );

  const { t } = useLingui();

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    enterLayoutCustomizationMode();
  };

  const handleNavigationMenuItemClick = useEditModeNavigationMenuItemClick();
  const handleActiveObjectMetadataItemClick = (
    _objectMetadataItem: EnrichedObjectMetadataItem,
    navigationMenuItemId: string,
  ) => {
    if (enterLayoutCustomizationMode()) {
      setSelectedNavigationMenuItemIdInEditMode(navigationMenuItemId);
    }
  };

  if (isCustomizableSidebarEnabled && items.length === 0) {
    return null;
  }

  return (
    <WorkspaceSectionContainer
      sectionTitle={isCustomizableSidebarEnabled ? undefined : t`Workspace`}
      items={items}
      rightIcon={
        // Customising the menu is desktop-only.
        isMobile || isCustomizableSidebarEnabled ? undefined : (
          <StyledRightIconsContainer>
            {isLayoutCustomizationModeEnabled ? (
              <WorkspaceSectionHeaderAddDropdown
                onOpen={openNavigationSection}
              />
            ) : (
              hasLayoutsPermission && (
                <div onMouseEnter={preloadNavigationMenuItemDndKit}>
                  <LightIconButton
                    emphasis="subtle"
                    size="sm"
                    onClick={handleEditClick}
                    aria-label={t`Edit navigation`}
                  >
                    <IconTool />
                  </LightIconButton>
                </div>
              )
            )}
          </StyledRightIconsContainer>
        )
      }
      selectedNavigationMenuItemId={selectedNavigationMenuItemIdInEditMode}
      onNavigationMenuItemClick={
        isLayoutCustomizationModeEnabled
          ? handleNavigationMenuItemClick
          : undefined
      }
      onActiveObjectMetadataItemClick={handleActiveObjectMetadataItemClick}
    />
  );
};
