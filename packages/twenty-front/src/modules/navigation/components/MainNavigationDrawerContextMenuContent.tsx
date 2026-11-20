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
import { navigationMenuDropdownIdToOpenState } from '@/navigation-menu-item/common/states/navigationMenuDropdownIdToOpenState';
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

  const customizeAndOpenDropdown = ({
    dropdownId,
    onCustomizationModeEntered,
  }: {
    dropdownId: string;
    onCustomizationModeEntered?: () => void;
  }) => {
    onClose();

    if (!enterLayoutCustomizationMode()) {
      return;
    }

    onCustomizationModeEntered?.();
    store.set(navigationMenuDropdownIdToOpenState.atom, dropdownId);
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

  const getAddItemOptions = (): NavigationMenuItemOption[] => {
    if (!isDefined(targetSection)) {
      return [];
    }

    const startAddingItem = () => {
      store.set(navigationMenuSectionIdAddingItemState.atom, targetSection.id);
      store.set(
        isNavigationSectionOpenFamilyState.atomFamily(
          getNavigationMenuSectionNavigationSectionId(targetSection),
        ),
        true,
      );
    };

    return [
      {
        id: 'add-item',
        label: t`Add item to ${targetSection.name}`,
        Icon: IconPlus,
        onClick: () =>
          customizeAndOpenDropdown({
            dropdownId: getNavigationMenuSectionMenuDropdownId(
              targetSection.id,
            ),
            onCustomizationModeEntered: startAddingItem,
          }),
      },
    ];
  };

  const addOptions: NavigationMenuItemOption[] = [
    ...getAddItemOptions(),
    {
      id: 'add-section',
      label: t`Add section`,
      Icon: IconNewSection,
      onClick: () =>
        customizeAndOpenDropdown({
          dropdownId: getNavigationMenuAddSectionDropdownId(containerId),
        }),
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
