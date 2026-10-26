import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconPlus, IconTool } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';
import { PermissionFlagType } from '~/generated-metadata/graphql';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { preloadNavigationMenuItemDndKit } from '@/navigation-menu-item/display/dnd/preloadNavigationMenuItemDndKit';
import { useDefaultWorkspaceSectionId } from '@/navigation-menu-item/display/hooks/useDefaultWorkspaceSectionId';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { WorkspaceSectionContainer } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionContainer';
import { useWorkspaceSectionItemClickHandlers } from '@/navigation-menu-item/display/sections/workspace/hooks/useWorkspaceSectionItemClickHandlers';
import { NavigationMenuItemAddDropdown } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdown';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledRightIconsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const WorkspaceSection = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const workspaceSectionId = useDefaultWorkspaceSectionId();
  const items = useNavigationMenuItemSectionItems(workspaceSectionId);
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { openNavigationSection } = useNavigationSection(
    doNotTranslate('Workspace'),
  );
  const {
    selectedNavigationMenuItemId,
    onNavigationMenuItemClick,
    onActiveObjectMetadataItemClick,
  } = useWorkspaceSectionItemClickHandlers();

  const handleEditClick = (event: MouseEvent) => {
    event.stopPropagation();
    enterLayoutCustomizationMode();
  };

  const addButton = (
    <LightIconButton emphasis="subtle" size="sm" aria-label={t`Add`}>
      <IconPlus />
    </LightIconButton>
  );
  const addDropdown = isDefined(workspaceSectionId) ? (
    <NavigationMenuItemAddDropdown
      instanceId="workspace-header"
      folderId={workspaceSectionId}
      position={0}
      onOpen={openNavigationSection}
    >
      {addButton}
    </NavigationMenuItemAddDropdown>
  ) : (
    <NavigationMenuItemAddDropdown
      instanceId="workspace-header"
      position={0}
      onOpen={openNavigationSection}
    >
      {addButton}
    </NavigationMenuItemAddDropdown>
  );

  return (
    <WorkspaceSectionContainer
      sectionTitle={t`Workspace`}
      items={items}
      containerId={workspaceSectionId}
      rightIcon={
        // Customising the menu is desktop-only.
        isMobile ? undefined : (
          <StyledRightIconsContainer>
            {isLayoutCustomizationModeEnabled
              ? addDropdown
              : hasLayoutsPermission && (
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
                )}
          </StyledRightIconsContainer>
        )
      }
      selectedNavigationMenuItemId={selectedNavigationMenuItemId}
      onNavigationMenuItemClick={onNavigationMenuItemClick}
      onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
    />
  );
};
