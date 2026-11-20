import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconChevronDown,
  IconChevronUp,
  IconNewSection,
  IconPaint,
  IconPlus,
} from 'twenty-ui/icon';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { NAVIGATION_SECTION_ID_BY_BUILT_IN_SECTION_KEY } from '@/navigation-menu-item/common/constants/NavigationSectionIdByBuiltInSectionKey';
import { navigationMenuSectionIdAddingItemState } from '@/navigation-menu-item/common/states/navigationMenuSectionIdAddingItemState';
import { isNavigationMenuItemBuiltInSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemBuiltInSection';
import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { getNavigationMenuSectionNavigationSectionId } from '@/navigation-menu-item/display/utils/getNavigationMenuSectionNavigationSectionId';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
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
  const containerId = activeNavigationMenuTab?.id ?? null;
  const sections = useWorkspaceNavigationMenuContainers({
    type: NavigationMenuItemType.SECTION,
    containerId,
  });
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const { openDropdown } = useOpenDropdown();

  const targetSection = sections.find(
    (section) =>
      section.id === targetSectionId &&
      !isNavigationMenuItemBuiltInSection(section),
  );

  const navigationSectionIds = [
    ...(isDefined(containerId)
      ? []
      : [NAVIGATION_SECTION_ID_BY_BUILT_IN_SECTION_KEY.favorites]),
    ...sections.map(getNavigationMenuSectionNavigationSectionId),
  ].filter(isDefined);

  const customizeAndOpenDropdown = (dropdownId: string) => {
    onClose();

    if (enterLayoutCustomizationMode()) {
      openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
    }
  };

  const setAllSectionsOpen = (isOpen: boolean) => {
    onClose();

    for (const navigationSectionId of new Set(navigationSectionIds)) {
      store.set(
        isNavigationSectionOpenFamilyState.atomFamily(navigationSectionId),
        isOpen,
      );
    }
  };

  const addOptions: NavigationMenuItemOption[] = [
    ...(isDefined(targetSection)
      ? [
          {
            id: 'add-item',
            label: t`Add item to ${targetSection.name}`,
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
              customizeAndOpenDropdown(
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
        customizeAndOpenDropdown(
          getNavigationMenuAddSectionDropdownId(containerId),
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
      <Dropdown.Section>
        <NavigationMenuItemSelectableItem
          item={{
            id: 'customize-sidebar',
            label: t`Customize sidebar`,
            Icon: IconPaint,
            onClick: () => {
              onClose();
              enterLayoutCustomizationMode();
            },
          }}
        />
      </Dropdown.Section>
      <Dropdown.Separator />
      <Dropdown.Section>
        {addOptions.map((option) => (
          <NavigationMenuItemSelectableItem key={option.id} item={option} />
        ))}
      </Dropdown.Section>
      {isNonEmptyArray(navigationSectionIds) && (
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
