import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuCollapsibleSectionNavigation } from '@/command-menu-item/types/CommandMenuCollapsibleSectionNavigation';
import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';

type CommandMenuSectionKeyboardAction = {
  section: CommandMenuItemSection;
  isOpen: boolean;
  itemIdToSelect?: string;
};

export const getCommandMenuSectionKeyboardAction = ({
  key,
  selectedItemId,
  collapsibleSections,
}: {
  key: 'ArrowLeft' | 'ArrowRight';
  selectedItemId: string | null;
  collapsibleSections: CommandMenuCollapsibleSectionNavigation[];
}): CommandMenuSectionKeyboardAction | null => {
  const selectedHeaderSection = collapsibleSections.find(
    ({ headerItemId }) => headerItemId === selectedItemId,
  );

  if (isDefined(selectedHeaderSection)) {
    const shouldOpen = key === 'ArrowRight';

    if (selectedHeaderSection.isOpen === shouldOpen) {
      return null;
    }

    return { section: selectedHeaderSection.section, isOpen: shouldOpen };
  }

  if (key !== 'ArrowLeft') {
    return null;
  }

  const selectedRowSection = collapsibleSections.find(
    ({ isOpen, itemIds }) =>
      isOpen && isDefined(selectedItemId) && itemIds.includes(selectedItemId),
  );

  if (!isDefined(selectedRowSection)) {
    return null;
  }

  return {
    section: selectedRowSection.section,
    isOpen: false,
    itemIdToSelect: selectedRowSection.headerItemId,
  };
};
