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
import { isNavigationMenuAddSectionRequestedState } from '@/navigation-menu-item/common/states/isNavigationMenuAddSectionRequestedState';
import { navigationMenuSectionIdAddingItemState } from '@/navigation-menu-item/common/states/navigationMenuSectionIdAddingItemState';
import { isNavigationMenuItemBuiltInSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemBuiltInSection';
import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { getNavigationMenuSectionNavigationSectionId } from '@/navigation-menu-item/display/utils/getNavigationMenuSectionNavigationSectionId';
import { NavigationMenuCustomizeSidebarMenuContent } from '@/navigation-menu-item/edit/components/NavigationMenuCustomizeSidebarMenuContent';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
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
  const containerId = useActiveNavigationMenuTab()?.id ?? null;
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
  const targetSectionName = targetSection?.name ?? '';

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
              onClose();
              store.set(
                navigationMenuSectionIdAddingItemState.atom,
                targetSection.id,
              );
              enterLayoutCustomizationMode();
            },
          },
        ]
      : []),
    {
      id: 'add-section',
      label: t`Add section`,
      Icon: IconNewSection,
      onClick: () => {
        onClose();
        store.set(isNavigationMenuAddSectionRequestedState.atom, true);
        enterLayoutCustomizationMode();
      },
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
      <NavigationMenuCustomizeSidebarMenuContent />
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
