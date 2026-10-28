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
import { navigationMenuSectionIdAddingItemState } from '@/navigation-menu-item/common/states/navigationMenuSectionIdAddingItemState';
import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { useWorkspaceNavigationMenuSections } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuSections';
import { getNavigationMenuSectionNavigationSectionId } from '@/navigation-menu-item/display/utils/getNavigationMenuSectionNavigationSectionId';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { NavigationMenuTabCustomizeMenuContent } from '@/navigation-menu-item/edit/components/NavigationMenuTabCustomizeMenuContent';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
import { getNavigationMenuAddSectionDropdownId } from '@/navigation-menu-item/edit/utils/getNavigationMenuAddSectionDropdownId';
import { getNavigationMenuSectionMenuDropdownId } from '@/navigation-menu-item/edit/utils/getNavigationMenuSectionMenuDropdownId';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';

type MainNavigationDrawerContextMenuContentProps = {
  targetSectionId: string | null;
  onClose: () => void;
};

export const MainNavigationDrawerContextMenuContent = ({
  targetSectionId,
  onClose,
}: MainNavigationDrawerContextMenuContentProps) => {
  const { t } = useLingui();
  const store = useStore();
  const activeNavigationMenuTab = useActiveNavigationMenuTab();
  const tabId = activeNavigationMenuTab?.id ?? null;
  const sections = useWorkspaceNavigationMenuSections(tabId);
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const { openDropdown } = useOpenDropdown();

  const targetSection = sections.find(
    (section) =>
      section.id === targetSectionId &&
      section.type === NavigationMenuItemType.SECTION,
  );
  const targetSectionName = targetSection?.name ?? '';

  const customizeSidebarWithPicker = (dropdownId: string) => {
    onClose();
    enterLayoutCustomizationMode();
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
  };

  const setAllSectionsOpen = (isOpen: boolean) => {
    onClose();

    for (const section of sections) {
      store.set(
        isNavigationSectionOpenFamilyState.atomFamily(
          getNavigationMenuSectionNavigationSectionId(section),
        ),
        isOpen,
      );
    }
  };

  const addOptions: NavigationMenuItemOption[] = [
    ...(isDefined(targetSection)
      ? [
          {
            id: 'add-item',
            label: t`Add item to ${targetSectionName}`,
            Icon: IconPlus,
            onClick: () => {
              store.set(
                navigationMenuSectionIdAddingItemState.atom,
                targetSection.id,
              );
              store.set(
                isNavigationSectionOpenFamilyState.atomFamily(
                  getNavigationMenuSectionNavigationSectionId(targetSection),
                ),
                true,
              );
              customizeSidebarWithPicker(
                getNavigationMenuSectionMenuDropdownId(targetSection.id),
              );
            },
          },
        ]
      : []),
    {
      id: 'add-section',
      label: t`Add section`,
      Icon: IconNewSection,
      onClick: () =>
        customizeSidebarWithPicker(
          getNavigationMenuAddSectionDropdownId(tabId),
        ),
    },
  ];

  const sectionOptions: NavigationMenuItemOption[] = [
    {
      id: 'collapse-all',
      label: t`Collapse all sections`,
      Icon: IconChevronUp,
      onClick: () => setAllSectionsOpen(false),
    },
    {
      id: 'expand-all',
      label: t`Expand all sections`,
      Icon: IconChevronDown,
      onClick: () => setAllSectionsOpen(true),
    },
  ];

  return (
    <>
      <NavigationMenuTabCustomizeMenuContent onClose={onClose} />
      <Dropdown.Separator />
      <Dropdown.Section>
        {addOptions.map((option) => (
          <NavigationMenuItemSelectableItem key={option.id} item={option} />
        ))}
      </Dropdown.Section>
      {sections.length > 0 && (
        <>
          <Dropdown.Separator />
          <Dropdown.Section>
            {sectionOptions.map((option) => (
              <NavigationMenuItemSelectableItem key={option.id} item={option} />
            ))}
          </Dropdown.Section>
        </>
      )}
    </>
  );
};
