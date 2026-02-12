import { useLingui } from '@lingui/react/macro';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuObjectPickerItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuObjectPickerItem';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { useFilteredPickerItems } from '@/command-menu/hooks/useFilteredPickerItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type CommandMenuSystemObjectPickerSubViewProps = {
  systemObjects: ObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  isViewItem: boolean;
  onSelectObjectForViewEdit?: (objectMetadataItem: ObjectMetadataItem) => void;
  onChangeObject: (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => void;
  objectMenuItemVariant?: 'add' | 'edit';
  emptyNoResultsText?: string;
};

export const CommandMenuSystemObjectPickerSubView = ({
  systemObjects,
  searchValue,
  onSearchChange,
  onBack,
  isViewItem,
  onSelectObjectForViewEdit,
  onChangeObject,
  objectMenuItemVariant = 'edit',
  emptyNoResultsText,
}: CommandMenuSystemObjectPickerSubViewProps) => {
  const { t } = useLingui();
  const { filteredItems, selectableItemIds, isEmpty, hasSearchQuery } =
    useFilteredPickerItems({
      items: systemObjects,
      searchQuery: searchValue,
      getSearchableValues: (item) => [item.labelPlural],
    });

  const noResultsText = hasSearchQuery
    ? t`No results found`
    : (emptyNoResultsText ?? t`No system objects available`);

  return (
    <CommandMenuSubViewWithSearch
      backBarTitle={t`System objects`}
      onBack={onBack}
      searchPlaceholder={t`Search a system object...`}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
    >
      <CommandMenuList
        commandGroups={[]}
        selectableItemIds={selectableItemIds}
        noResults={isEmpty}
        noResultsText={noResultsText}
      >
        <CommandGroup heading={t`System objects`}>
          {filteredItems.map((objectMetadataItem) => (
            <CommandMenuObjectPickerItem
              key={objectMetadataItem.id}
              objectMetadataItem={objectMetadataItem}
              isViewItem={isViewItem}
              onSelectObjectForViewEdit={onSelectObjectForViewEdit}
              onChangeObject={onChangeObject}
              objectMenuItemVariant={objectMenuItemVariant}
            />
          ))}
        </CommandGroup>
      </CommandMenuList>
    </CommandMenuSubViewWithSearch>
  );
};
