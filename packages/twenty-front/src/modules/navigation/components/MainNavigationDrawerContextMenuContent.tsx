import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconChevronDown,
  IconChevronUp,
  IconNewSection,
  IconPlus,
} from 'twenty-ui/icon';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { navigationMenuSectionIdToAddItemState } from '@/navigation-menu-item/common/states/navigationMenuSectionIdToAddItemState';
import { getNavigationMenuSectionNavigationSectionId } from '@/navigation-menu-item/common/utils/getNavigationMenuSectionNavigationSectionId';
import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { NavigationMenuCustomizeSidebarMenuContent } from '@/navigation-menu-item/edit/components/NavigationMenuCustomizeSidebarMenuContent';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { getNavigationMenuAddSectionDropdownId } from '@/navigation-menu-item/edit/utils/getNavigationMenuAddSectionDropdownId';
import { getContextMenuTargetSection } from '@/navigation/utils/getContextMenuTargetSection';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';

type MainNavigationDrawerContextMenuContentProps = {
  targetSectionId: string | null;
};

export const MainNavigationDrawerContextMenuContent = ({
  targetSectionId,
}: MainNavigationDrawerContextMenuContentProps) => {
  const { t } = useLingui();
  const store = useStore();
  const { closeDropdown } = useCloseDropdown();
  const { openDropdown } = useOpenDropdown();
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const activeNavigationMenuTab = useActiveNavigationMenuTab();
  const containerId = activeNavigationMenuTab?.id ?? null;
  const sections = useWorkspaceNavigationMenuContainers({
    type: NavigationMenuItemType.SECTION,
    containerId,
  });

  const targetSection = getContextMenuTargetSection({
    sections,
    targetSectionId,
  });
  const targetSectionName = targetSection?.name ?? '';

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

  const addItemToTargetSection = (sectionId: string) => {
    closeDropdown();

    if (enterLayoutCustomizationMode()) {
      store.set(navigationMenuSectionIdToAddItemState.atom, sectionId);
    }
  };

  const addSection = () => {
    closeDropdown();

    if (enterLayoutCustomizationMode()) {
      openDropdown({
        dropdownComponentInstanceIdFromProps:
          getNavigationMenuAddSectionDropdownId(containerId),
      });
    }
  };

  return (
    <>
      <NavigationMenuCustomizeSidebarMenuContent />
      <Dropdown.Separator />
      <Dropdown.Section>
        {isDefined(targetSection) && (
          <NavigationMenuItemSelectableItem
            item={{
              id: 'add-item-to-section',
              label: t`Add item to ${targetSectionName}`,
              Icon: IconPlus,
              onClick: () => addItemToTargetSection(targetSection.id),
            }}
          />
        )}
        <NavigationMenuItemSelectableItem
          item={{
            id: 'add-section',
            label: t`Add section`,
            Icon: IconNewSection,
            onClick: addSection,
          }}
        />
      </Dropdown.Section>
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
