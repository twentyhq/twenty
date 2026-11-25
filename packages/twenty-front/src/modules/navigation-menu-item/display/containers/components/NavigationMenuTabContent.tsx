import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useEffect } from 'react';
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
import { shouldOpenFirstTabSwitchTargetState } from '@/ui/navigation/states/shouldOpenFirstTabSwitchTargetState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuTabContentProps = {
  containerId: string | null;
};

export const NavigationMenuTabContent = ({
  containerId,
}: NavigationMenuTabContentProps) => {
  const { t } = useLingui();
  const store = useStore();
  const canCustomizeSidebar = useCanCustomizeSidebar();
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { topLevelItems } = useNavigationMenuContainerItems(containerId);
  const sections = useWorkspaceNavigationMenuContainers({
    type: NavigationMenuItemType.SECTION,
    containerId,
  });

  const isEmptyTab = topLevelItems.length === 0 && sections.length === 0;

  useEffect(() => {
    store.set(shouldOpenFirstTabSwitchTargetState.atom, false);
  }, [store]);

  return (
    <>
      <NavigationMenuContainerContent containerId={containerId} />
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
