import { NavigationMenuItemAddDropdown } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdown';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useNavigate } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { LightIconButton } from 'twenty-ui/components';
import { IconPlus, IconTool } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { preloadNavigationMenuItemDndKit } from '@/navigation-menu-item/display/dnd/preloadNavigationMenuItemDndKit';
import {
  type NavigationMenuItemClickParams,
  useNavigationMenuItemSectionItems,
} from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { WorkspaceSectionContainer } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionContainer';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const StyledRightIconsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const WorkspaceSection = () => {
  const isMobile = useIsMobile();
  const items = useNavigationMenuItemSectionItems();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const lastVisitedViewPerObjectMetadataItem = useAtomStateValue(
    lastVisitedViewPerObjectMetadataItemState,
  );
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const isInitialObjectViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_INITIAL_OBJECT_VIEW_ENABLED,
  );
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const [
    selectedNavigationMenuItemIdInEditMode,
    setSelectedNavigationMenuItemIdInEditMode,
  ] = useAtomState(selectedNavigationMenuItemIdInEditModeState);
  const navigate = useNavigate();
  const { openNavigationSection } = useNavigationSection('Workspace');

  const { t } = useLingui();

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    enterLayoutCustomizationMode();
  };

  const handleNavigationMenuItemClick = ({
    item,
  }: NavigationMenuItemClickParams) => {
    setSelectedNavigationMenuItemIdInEditMode(item.id);
    if (
      item.type === NavigationMenuItemType.FOLDER ||
      item.type === NavigationMenuItemType.LINK
    ) {
      return;
    }
    const link = getNavigationMenuItemComputedLink({
      item,
      objectMetadataItems,
      views,
      lastVisitedViewPerObjectMetadataItem,
      isInitialObjectViewEnabled,
    });
    if (isNonEmptyString(link)) {
      navigate(link);
    }
  };
  const handleActiveObjectMetadataItemClick = (
    _objectMetadataItem: EnrichedObjectMetadataItem,
    navigationMenuItemId: string,
  ) => {
    if (enterLayoutCustomizationMode()) {
      setSelectedNavigationMenuItemIdInEditMode(navigationMenuItemId);
    }
  };

  return (
    <WorkspaceSectionContainer
      sectionTitle={t`Workspace`}
      items={items}
      rightIcon={
        // Customising the menu is a desktop job, so mobile shows neither the
        // entry point nor the add button it turns into.
        isMobile ? undefined : (
          <StyledRightIconsContainer>
            {isLayoutCustomizationModeEnabled ? (
              <NavigationMenuItemAddDropdown
                instanceId="workspace-header"
                position={0}
                onOpen={openNavigationSection}
              >
                <LightIconButton
                  emphasis="subtle"
                  size="sm"
                  aria-label={t`Add`}
                >
                  <IconPlus />
                </LightIconButton>
              </NavigationMenuItemAddDropdown>
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
