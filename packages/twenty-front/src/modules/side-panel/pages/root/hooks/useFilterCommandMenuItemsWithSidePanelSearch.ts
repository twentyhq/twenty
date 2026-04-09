import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { getCommandMenuItemLabel } from '@/command-menu-item/utils/getCommandMenuItemLabel';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const checkInShortcuts = (
  commandMenuItem: CommandMenuItemConfig,
  search: string,
) => {
  const concatenatedString = commandMenuItem.hotKeys?.join('') ?? '';
  const searchNormalized = normalizeSearchText(search.trim());
  return normalizeSearchText(concatenatedString).includes(searchNormalized);
};

const checkInLabels = (
  commandMenuItem: CommandMenuItemConfig,
  search: string,
) => {
  const commandMenuItemLabel = getCommandMenuItemLabel(commandMenuItem.label);
  if (isNonEmptyString(commandMenuItemLabel)) {
    const searchNormalized = normalizeSearchText(search);
    return normalizeSearchText(commandMenuItemLabel).includes(searchNormalized);
  }
  return false;
};

type UseFilterCommandMenuItemsWithSidePanelSearchProps = {
  sidePanelSearch: string;
};

export const useFilterCommandMenuItemsWithSidePanelSearch = ({
  sidePanelSearch,
}: UseFilterCommandMenuItemsWithSidePanelSearchProps) => {
  const filterCommandMenuItemsWithSidePanelSearch = useCallback(
    (commandMenuItems: CommandMenuItemConfig[]) => {
      return commandMenuItems.filter((commandMenuItem) =>
        sidePanelSearch.length > 0
          ? checkInShortcuts(commandMenuItem, sidePanelSearch) ||
            checkInLabels(commandMenuItem, sidePanelSearch)
          : true,
      );
    },
    [sidePanelSearch],
  );

  return {
    filterCommandMenuItemsWithSidePanelSearch,
  };
};
