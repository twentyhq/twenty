import { useLingui } from '@lingui/react/macro';
import { IconTool } from 'twenty-ui/icon';
import {
  type NavigationMenuItem,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

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
  tab: NavigationMenuItem;
};

export const NavigationMenuTabContent = ({
  tab,
}: NavigationMenuTabContentProps) => {
  const { t } = useLingui();
  const items = useNavigationMenuItemSectionItems(tab.id);
  const sections = useWorkspaceNavigationMenuSections(tab.id);
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
      {(isLayoutCustomizationModeEnabled || items.length > 0) && (
        <WorkspaceSectionContainer
          sectionTitle={tab.name ?? ''}
          items={items}
          containerId={tab.id}
          isTitleHidden
          selectedNavigationMenuItemId={selectedNavigationMenuItemId}
          onNavigationMenuItemClick={onNavigationMenuItemClick}
          onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
        />
      )}
      <NavigationMenuItemCustomSections parentId={tab.id} />
      {!isLayoutCustomizationModeEnabled && isEmpty && hasLayoutsPermission && (
        <NavigationDrawerSection>
          <NavigationDrawerItem
            Icon={IconTool}
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
