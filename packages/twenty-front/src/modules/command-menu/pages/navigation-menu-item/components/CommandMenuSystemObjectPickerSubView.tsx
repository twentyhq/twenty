import { useLingui } from '@lingui/react/macro';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuAddToNavDroppable } from '@/command-menu/components/CommandMenuAddToNavDroppable';
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
  disableDrag?: boolean;
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
  disableDrag = false,
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

  const isAddVariant = objectMenuItemVariant === 'add';

  const listContent = (
    <CommandGroup heading={t`System objects`}>
      {filteredItems.map((objectMetadataItem, index) => (
        <CommandMenuObjectPickerItem
          key={objectMetadataItem.id}
          objectMetadataItem={objectMetadataItem}
          isViewItem={isViewItem}
          onSelectObjectForViewEdit={onSelectObjectForViewEdit}
          onChangeObject={onChangeObject}
          objectMenuItemVariant={objectMenuItemVariant}
          dragIndex={isAddVariant && !disableDrag ? index : undefined}
          disableDrag={disableDrag}
        />
      ))}
    </CommandGroup>
  );

  return (
    <CommandMenuSubViewWithSearch
      backBarTitle={t`System objects`}
      onBack={onBack}
      searchPlaceholder={t`Search a system object...`}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
    >
      {isAddVariant ? (
        <CommandMenuAddToNavDroppable>
          {({ innerRef, droppableProps, placeholder }) => (
            <CommandMenuList
              commandGroups={[]}
              selectableItemIds={selectableItemIds}
              noResults={isEmpty}
              noResultsText={noResultsText}
            >
              {/* eslint-disable-next-line react/jsx-props-no-spreading */}
              <div ref={innerRef} {...droppableProps}>
                {listContent}
                {placeholder}
              </div>
            </CommandMenuList>
          )}
        </CommandMenuAddToNavDroppable>
      ) : (
        <CommandMenuList
          commandGroups={[]}
          selectableItemIds={selectableItemIds}
          noResults={isEmpty}
          noResultsText={noResultsText}
        >
          {listContent}
        </CommandMenuList>
      )}
    </CommandMenuSubViewWithSearch>
  );
};
