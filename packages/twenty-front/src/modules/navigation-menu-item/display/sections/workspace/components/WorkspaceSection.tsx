import { NavigationMenuItemAddDropdown } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdown';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconPlus, IconTool } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { preloadNavigationMenuItemDndKit } from '@/navigation-menu-item/display/dnd/preloadNavigationMenuItemDndKit';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { WorkspaceSectionContainer } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionContainer';
import { useWorkspaceSectionItemClickHandlers } from '@/navigation-menu-item/display/sections/workspace/hooks/useWorkspaceSectionItemClickHandlers';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { PermissionFlagType } from '~/generated-metadata/graphql';
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
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const {
    selectedNavigationMenuItemId,
    onNavigationMenuItemClick,
    onActiveObjectMetadataItemClick,
  } = useWorkspaceSectionItemClickHandlers();
  const { openNavigationSection } = useNavigationSection(
    doNotTranslate('Workspace'),
  );

  const { t } = useLingui();

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    enterLayoutCustomizationMode();
  };

  return (
    <WorkspaceSectionContainer
      sectionTitle={t`Workspace`}
      items={items}
      rightIcon={
        // Customising the menu is desktop-only.
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
      selectedNavigationMenuItemId={selectedNavigationMenuItemId}
      onNavigationMenuItemClick={onNavigationMenuItemClick}
      onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
    />
  );
};
