import { type CommandMenuItemConfig } from '@/command-menu-item/actions/types/CommandMenuItemConfig';
import { getActionLabel } from '@/command-menu-item/utils/getActionLabel';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const checkInShortcuts = (action: CommandMenuItemConfig, search: string) => {
  const concatenatedString = action.hotKeys?.join('') ?? '';
  const searchNormalized = normalizeSearchText(search.trim());
  return normalizeSearchText(concatenatedString).includes(searchNormalized);
};

const checkInLabels = (action: CommandMenuItemConfig, search: string) => {
  const actionLabel = getActionLabel(action.label);
  if (isNonEmptyString(actionLabel)) {
    const searchNormalized = normalizeSearchText(search);
    return normalizeSearchText(actionLabel).includes(searchNormalized);
  }
  return false;
};

type UseFilterActionsWithSidePanelSearchProps = {
  sidePanelSearch: string;
};

export const useFilterActionsWithSidePanelSearch = ({
  sidePanelSearch,
}: UseFilterActionsWithSidePanelSearchProps) => {
  const filterActionsWithSidePanelSearch = useCallback(
    (actions: CommandMenuItemConfig[]) => {
      return actions.filter((action) =>
        sidePanelSearch.length > 0
          ? checkInShortcuts(action, sidePanelSearch) ||
            checkInLabels(action, sidePanelSearch)
          : true,
      );
    },
    [sidePanelSearch],
  );

  return {
    filterActionsWithSidePanelSearch,
  };
};
