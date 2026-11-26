import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';

import { getNavigationMenuSectionNavigationSectionId } from '@/navigation-menu-item/common/utils/getNavigationMenuSectionNavigationSectionId';
import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { NavigationMenuCustomizeSidebarMenuContent } from '@/navigation-menu-item/edit/components/NavigationMenuCustomizeSidebarMenuContent';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';

export const MainNavigationDrawerContextMenuContent = () => {
  const { t } = useLingui();
  const store = useStore();
  const { closeDropdown } = useCloseDropdown();
  const activeNavigationMenuTab = useActiveNavigationMenuTab();
  const sections = useWorkspaceNavigationMenuContainers({
    type: NavigationMenuItemType.SECTION,
    containerId: activeNavigationMenuTab?.id ?? null,
  });

  const setAllSectionsOpen = (isOpen: boolean) => {
    closeDropdown();

    for (const section of sections) {
      store.set(
        isNavigationSectionOpenFamilyState.atomFamily(
          getNavigationMenuSectionNavigationSectionId(section),
        ),
        isOpen,
      );
    }
  };

  return (
    <>
      <NavigationMenuCustomizeSidebarMenuContent />
      {sections.length > 0 && (
        <>
          <Dropdown.Separator />
          <Dropdown.Section>
            <NavigationMenuItemSelectableItem
              item={{
                id: 'collapse-all-sections',
                label: t`Collapse all sections`,
                Icon: IconChevronUp,
                onClick: () => setAllSectionsOpen(false),
              }}
            />
            <NavigationMenuItemSelectableItem
              item={{
                id: 'expand-all-sections',
                label: t`Expand all sections`,
                Icon: IconChevronDown,
                onClick: () => setAllSectionsOpen(true),
              }}
            />
          </Dropdown.Section>
        </>
      )}
    </>
  );
};
