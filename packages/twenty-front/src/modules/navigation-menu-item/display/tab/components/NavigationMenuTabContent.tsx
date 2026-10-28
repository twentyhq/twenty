import { useLingui } from '@lingui/react/macro';
import { IconPaint } from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { useWorkspaceNavigationMenuSections } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuSections';
import { NavigationMenuItemCustomSections } from '@/navigation-menu-item/display/sections/custom/components/NavigationMenuItemCustomSections';
import { WorkspaceSectionContainer } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionContainer';
import { useWorkspaceSectionItemClickHandlers } from '@/navigation-menu-item/display/sections/workspace/hooks/useWorkspaceSectionItemClickHandlers';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuTabContentProps = {
  tabId: string | null;
};

export const NavigationMenuTabContent = ({
  tabId,
}: NavigationMenuTabContentProps) => {
  const { t } = useLingui();
  const items = useNavigationMenuItemSectionItems(tabId);
  const sections = useWorkspaceNavigationMenuSections(tabId);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const {
    selectedNavigationMenuItemId,
    onNavigationMenuItemClick,
    onActiveObjectMetadataItemClick,
  } = useWorkspaceSectionItemClickHandlers();

  const isEmpty = items.length === 0 && sections.length === 0;

  return (
    <>
      <NavigationMenuItemCustomSections
        parentId={tabId}
        placement="above-items"
      />
      {items.length > 0 && (
        <WorkspaceSectionContainer
          sectionTitle=""
          items={items}
          containerId={tabId}
          isTitleHidden
          addMenuItemButton={false}
          selectedNavigationMenuItemId={selectedNavigationMenuItemId}
          onNavigationMenuItemClick={onNavigationMenuItemClick}
          onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
        />
      )}
      <NavigationMenuItemCustomSections
        parentId={tabId}
        placement="below-items"
      />
      {!isLayoutCustomizationModeEnabled && isEmpty && hasLayoutsPermission && (
        <NavigationDrawerSection>
          <NavigationDrawerItem
            Icon={IconPaint}
            label={t`Customize tab`}
            onClick={() => enterLayoutCustomizationMode()}
            triggerEvent="CLICK"
            variant="tertiary"
          />
        </NavigationDrawerSection>
      )}
    </>
  );
};
