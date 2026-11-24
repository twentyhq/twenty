import { isNonEmptyString } from '@sniptt/guards';

import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';
import { type CommandMenuItemSectionsToggleState } from '@/command-menu-item/types/CommandMenuItemSectionsToggleState';
import { isCollapsibleCommandMenuItemSection } from '@/command-menu-item/utils/isCollapsibleCommandMenuItemSection';

export const isCommandMenuItemSectionOpen = ({
  section,
  search,
  toggleState,
}: {
  section: CommandMenuItemSection;
  search: string;
  toggleState: CommandMenuItemSectionsToggleState;
}): boolean => {
  if (!isCollapsibleCommandMenuItemSection(section)) {
    return true;
  }

  const trimmedSearch = search.trim();

  if (!isNonEmptyString(trimmedSearch)) {
    return toggleState.openSectionsWhileIdle.includes(section);
  }

  const { closedSectionsWhileSearching } = toggleState;

  return !(
    closedSectionsWhileSearching.search === trimmedSearch &&
    closedSectionsWhileSearching.sections.includes(section)
  );
};
