import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { IconPaint } from 'twenty-ui/icon';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NavigationMenuContainerContent } from '@/navigation-menu-item/display/containers/components/NavigationMenuContainerContent';
import { useNavigationMenuContainerItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuContainerItems';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { useCanCustomizeSidebar } from '@/navigation/hooks/useCanCustomizeSidebar';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuTabContentProps = {
  tab: Pick<NavigationMenuItem, 'id'>;
};

export const NavigationMenuTabContent = ({
  tab,
}: NavigationMenuTabContentProps) => {
  const { t } = useLingui();
  const canCustomizeSidebar = useCanCustomizeSidebar();
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { topLevelItems } = useNavigationMenuContainerItems(tab.id);
  const sections = useWorkspaceNavigationMenuContainers({
    type: NavigationMenuItemType.SECTION,
    containerId: tab.id,
  });

  const isEmptyTab = topLevelItems.length === 0 && sections.length === 0;

  return (
    <>
      <NavigationMenuContainerContent containerId={tab.id} />
      {!isLayoutCustomizationModeEnabled &&
        isEmptyTab &&
        canCustomizeSidebar && (
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
