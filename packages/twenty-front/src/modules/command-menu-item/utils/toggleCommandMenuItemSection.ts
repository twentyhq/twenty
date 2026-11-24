import { isNonEmptyString } from '@sniptt/guards';

import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';
import { type CommandMenuItemSectionsToggleState } from '@/command-menu-item/types/CommandMenuItemSectionsToggleState';

export const toggleCommandMenuItemSection = ({
  section,
  isOpen,
  search,
  toggleState,
}: {
  section: CommandMenuItemSection;
  isOpen: boolean;
  search: string;
  toggleState: CommandMenuItemSectionsToggleState;
}): CommandMenuItemSectionsToggleState => {
  const trimmedSearch = search.trim();

  if (!isNonEmptyString(trimmedSearch)) {
    const otherOpenSections = toggleState.openSectionsWhileIdle.filter(
      (openSection) => openSection !== section,
    );

    return {
      ...toggleState,
      openSectionsWhileIdle: isOpen
        ? [...otherOpenSections, section]
        : otherOpenSections,
    };
  }

  const closedSectionsForSearch =
    toggleState.closedSectionsWhileSearching.search === trimmedSearch
      ? toggleState.closedSectionsWhileSearching.sections
      : [];

  const otherClosedSections = closedSectionsForSearch.filter(
    (closedSection) => closedSection !== section,
  );

  return {
    ...toggleState,
    closedSectionsWhileSearching: {
      search: trimmedSearch,
      sections: isOpen
        ? otherClosedSections
        : [...otherClosedSections, section],
    },
  };
};
