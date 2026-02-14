import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { IconFolderPlus } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { useFolderPickerSelectionData } from '@/command-menu/pages/navigation-menu-item/hooks/useFolderPickerSelectionData';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type CommandMenuEditFolderPickerSubViewProps = {
  onBack: () => void;
};

export const CommandMenuEditFolderPickerSubView = ({
  onBack,
}: CommandMenuEditFolderPickerSubViewProps) => {
  const { t } = useLingui();
  const [searchValue, setSearchValue] = useState('');
  const { foldersToShow, includeNoFolderOption, handleSelectFolder } =
    useFolderPickerSelectionData({ onCloseSubView: onBack });

  const filteredFolders = filterBySearchQuery({
    items: foldersToShow,
    searchQuery: searchValue,
    getSearchableValues: (folder) => [folder.name],
  });
  const isEmpty = filteredFolders.length === 0 && !includeNoFolderOption;
  const selectableItemIds = [
    ...(includeNoFolderOption ? ['no-folder'] : []),
    ...(filteredFolders.length > 0 ? filteredFolders.map((f) => f.id) : []),
  ];
  const noResultsText =
    searchValue.trim().length > 0
      ? t`No results found`
      : t`No folders available`;

  return (
    <CommandMenuSubViewWithSearch
      backBarTitle={t`Move to a folder`}
      onBack={onBack}
      searchPlaceholder={t`Search a folder...`}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
    >
      <CommandMenuList
        commandGroups={[]}
        selectableItemIds={selectableItemIds}
        noResults={isEmpty}
        noResultsText={noResultsText}
      >
        <CommandGroup heading={t`Folders`}>
          {includeNoFolderOption && (
            <SelectableListItem
              itemId="no-folder"
              onEnter={() => handleSelectFolder(null)}
            >
              <CommandMenuItem
                label={t`No folder`}
                id="no-folder"
                onClick={() => handleSelectFolder(null)}
              />
            </SelectableListItem>
          )}
          {filteredFolders.map((folder) => (
            <SelectableListItem
              key={folder.id}
              itemId={folder.id}
              onEnter={() => handleSelectFolder(folder.id)}
            >
              <CommandMenuItem
                Icon={IconFolderPlus}
                label={folder.name}
                id={folder.id}
                onClick={() => handleSelectFolder(folder.id)}
              />
            </SelectableListItem>
          ))}
        </CommandGroup>
      </CommandMenuList>
    </CommandMenuSubViewWithSearch>
  );
};
