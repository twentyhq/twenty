import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { IconPaint } from 'twenty-ui/icon';
import { useIsMobile } from 'twenty-ui/utilities';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NavigationMenuContainerEditableItems } from '@/navigation-menu-item/display/containers/components/NavigationMenuContainerEditableItems';
import { useNavigationMenuContainerItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuContainerItems';
import { NavigationMenuSectionList } from '@/navigation-menu-item/display/containers/components/NavigationMenuSectionList';
import { WorkspaceSectionListReadOnly } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListReadOnly';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  type NavigationMenuItem,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

type NavigationMenuTabContentProps = {
  tab: Pick<NavigationMenuItem, 'id'>;
};

export const NavigationMenuTabContent = ({
  tab,
}: NavigationMenuTabContentProps) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { topLevelItems, folderChildrenById } = useNavigationMenuContainerItems(
    tab.id,
  );
  const sections = useWorkspaceNavigationMenuContainers({
    type: NavigationMenuItemType.SECTION,
    containerId: tab.id,
  });

  if (isLayoutCustomizationModeEnabled) {
    return (
      <>
        <NavigationDrawerSection>
          <NavigationMenuContainerEditableItems
            containerId={tab.id}
            topLevelItems={topLevelItems}
            folderChildrenById={folderChildrenById}
          />
        </NavigationDrawerSection>
        <NavigationMenuSectionList containerId={tab.id} />
      </>
    );
  }

  return (
    <>
      {topLevelItems.length > 0 && (
        <NavigationDrawerSection>
          <WorkspaceSectionListReadOnly
            filteredItems={topLevelItems}
            folderChildrenById={folderChildrenById}
          />
        </NavigationDrawerSection>
      )}
      <NavigationMenuSectionList containerId={tab.id} />
      {topLevelItems.length === 0 &&
        sections.length === 0 &&
        hasLayoutsPermission &&
        !isMobile && (
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
