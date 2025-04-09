import { ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { isNonEmptyString } from '@sniptt/guards';
import { useDebounce } from 'use-debounce';

export const useFilterActionsWithCommandMenuSearch = ({
  commandMenuSearch,
}: {
  commandMenuSearch: string;
}) => {
  const [deferredCommandMenuSearch] = useDebounce(commandMenuSearch, 300); // 200ms - 500ms

  const checkInShortcuts = (action: ActionConfig, search: string) => {
    const concatenatedString = action.hotKeys?.join('') ?? '';
    return concatenatedString
      .toLowerCase()
      .includes(search.toLowerCase().trim());
  };

  const checkInLabels = (action: ActionConfig, search: string) => {
    const actionLabel = getActionLabel(action.label);
    if (isNonEmptyString(actionLabel)) {
      return actionLabel.toLowerCase().includes(search.toLowerCase());
    }
    return false;
  };

  const filterActionsWithCommandMenuSearch = (actions: ActionConfig[]) => {
    return actions.filter((action) =>
      deferredCommandMenuSearch.length > 0
        ? checkInShortcuts(action, deferredCommandMenuSearch) ||
          checkInLabels(action, deferredCommandMenuSearch)
        : true,
    );
  };

  return {
    filterActionsWithCommandMenuSearch,
  };
};
