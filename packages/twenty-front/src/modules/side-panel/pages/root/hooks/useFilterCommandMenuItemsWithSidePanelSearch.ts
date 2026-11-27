import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { interpolateMessagePlaceholders } from 'twenty-shared/i18n';
import { type CommandMenuContextApi } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getCommandMenuItemPlaceholderValues } from '@/command-menu-item/utils/getCommandMenuItemPlaceholderValues';
import { getCommandMenuItemSubtitle } from '@/command-menu-item/utils/getCommandMenuItemSubtitle';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';
import { normalizeSearchText } from 'twenty-ui/utilities';

const checkInShortcuts = (
  commandMenuItem: CommandMenuItemFieldsFragment,
  search: string,
) => {
  const concatenatedString = commandMenuItem.hotKeys?.join('') ?? '';
  const searchNormalized = normalizeSearchText(search.trim());
  return normalizeSearchText(concatenatedString).includes(searchNormalized);
};

const checkInLabels = (
  commandMenuItem: CommandMenuItemFieldsFragment,
  search: string,
  commandMenuContextApi: CommandMenuContextApi,
) => {
  const label = interpolateMessagePlaceholders(
    commandMenuItem.label,
    getCommandMenuItemPlaceholderValues(commandMenuContextApi),
  );

  if (!isNonEmptyString(label)) {
    return false;
  }

  const subtitle = getCommandMenuItemSubtitle(commandMenuItem);
  const searchableText = isDefined(subtitle) ? `${label} ${subtitle}` : label;

  return normalizeSearchText(searchableText).includes(
    normalizeSearchText(search),
  );
};

type UseFilterCommandMenuItemsWithSidePanelSearchProps = {
  sidePanelSearch: string;
  commandMenuContextApi: CommandMenuContextApi;
};

export const useFilterCommandMenuItemsWithSidePanelSearch = ({
  sidePanelSearch,
  commandMenuContextApi,
}: UseFilterCommandMenuItemsWithSidePanelSearchProps) => {
  const filterCommandMenuItemsWithSidePanelSearch = useCallback(
    <TCommandMenuItem extends CommandMenuItemFieldsFragment>(
      commandMenuItems: TCommandMenuItem[],
    ) => {
      return commandMenuItems.filter((commandMenuItem) =>
        sidePanelSearch.length > 0
          ? checkInShortcuts(commandMenuItem, sidePanelSearch) ||
            checkInLabels(
              commandMenuItem,
              sidePanelSearch,
              commandMenuContextApi,
            )
          : true,
      );
    },
    [sidePanelSearch, commandMenuContextApi],
  );

  return {
    filterCommandMenuItemsWithSidePanelSearch,
  };
};
