import { type ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const checkInShortcuts = (action: ActionConfig, search: string) => {
  const concatenatedString = action.hotKeys?.join('') ?? '';
  const searchNormalized = normalizeSearchText(search.trim());
  return normalizeSearchText(concatenatedString).includes(searchNormalized);
};

const checkInLabels = (action: ActionConfig, search: string) => {
  const actionLabel = getActionLabel(action.label);
  if (isNonEmptyString(actionLabel)) {
    const searchNormalized = normalizeSearchText(search);
    return normalizeSearchText(actionLabel).includes(searchNormalized);
  }
  return false;
};

type UseFilterActionsWithCommandMenuSearchProps = {
  commandMenuSearch: string;
};

export const useFilterActionsWithCommandMenuSearch = ({
  commandMenuSearch,
}: UseFilterActionsWithCommandMenuSearchProps) => {
  const filterActionsWithCommandMenuSearch = useCallback(
    (actions: ActionConfig[]) => {
      return actions.filter((action) =>
        commandMenuSearch.length > 0
          ? checkInShortcuts(action, commandMenuSearch) ||
            checkInLabels(action, commandMenuSearch)
          : true,
      );
    },
    [commandMenuSearch],
  );

  return {
    filterActionsWithCommandMenuSearch,
  };
};
