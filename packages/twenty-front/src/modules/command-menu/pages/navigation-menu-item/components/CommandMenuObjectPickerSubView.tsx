import { useLingui } from '@lingui/react/macro';
import { IconSettings } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuAddToNavDraggablePlaceholder } from '@/command-menu/components/CommandMenuAddToNavDraggablePlaceholder';
import { CommandMenuAddToNavDroppable } from '@/command-menu/components/CommandMenuAddToNavDroppable';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { useFilteredPickerItems } from '@/command-menu/hooks/useFilteredPickerItems';
import { CommandMenuObjectPickerItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuObjectPickerItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CommandMenuObjectPickerSubViewProps = {
  objects: ObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onOpenSystemPicker: () => void;
  isViewItem: boolean;
  onSelectObjectForViewEdit?: (objectMetadataItem: ObjectMetadataItem) => void;
  onChangeObject: (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => void;
  objectMenuItemVariant?: 'add' | 'edit';
  emptyNoResultsText?: string;
};

export const CommandMenuObjectPickerSubView = ({
  objects,
  searchValue,
  onSearchChange,
  onBack,
  onOpenSystemPicker,
  isViewItem,
  onSelectObjectForViewEdit,
  onChangeObject,
  objectMenuItemVariant = 'edit',
  emptyNoResultsText,
}: CommandMenuObjectPickerSubViewProps) => {
  const { t } = useLingui();
  const { filteredItems, selectableItemIds, isEmpty, hasSearchQuery } =
    useFilteredPickerItems({
      items: objects,
      searchQuery: searchValue,
      getSearchableValues: (item) => [item.labelPlural],
      appendSelectableIds: ['system'],
    });

  const noResultsText = hasSearchQuery
    ? t`No results found`
    : (emptyNoResultsText ?? t`All objects are already in the sidebar`);

  const isAddVariant = objectMenuItemVariant === 'add';

  const listContent = (
    <CommandGroup heading={t`Objects`}>
      {filteredItems.map((objectMetadataItem, index) => (
        <CommandMenuObjectPickerItem
          key={objectMetadataItem.id}
          objectMetadataItem={objectMetadataItem}
          isViewItem={isViewItem}
          onSelectObjectForViewEdit={onSelectObjectForViewEdit}
          onChangeObject={onChangeObject}
          objectMenuItemVariant={objectMenuItemVariant}
          dragIndex={isAddVariant ? index : undefined}
        />
      ))}
      {isAddVariant ? (
        <CommandMenuAddToNavDraggablePlaceholder index={filteredItems.length}>
          <SelectableListItem itemId="system" onEnter={onOpenSystemPicker}>
            <CommandMenuItem
              Icon={IconSettings}
              label={t`System objects`}
              id="system"
              hasSubMenu={true}
              onClick={onOpenSystemPicker}
            />
          </SelectableListItem>
        </CommandMenuAddToNavDraggablePlaceholder>
      ) : (
        <SelectableListItem itemId="system" onEnter={onOpenSystemPicker}>
          <CommandMenuItem
            Icon={IconSettings}
            label={t`System objects`}
            id="system"
            hasSubMenu={true}
            onClick={onOpenSystemPicker}
          />
        </SelectableListItem>
      )}
    </CommandGroup>
  );

  return (
    <CommandMenuSubViewWithSearch
      backBarTitle={t`Pick an object`}
      onBack={onBack}
      searchPlaceholder={t`Search an object...`}
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
