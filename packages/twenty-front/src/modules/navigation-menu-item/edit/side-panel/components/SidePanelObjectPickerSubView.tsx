import { useLingui } from '@lingui/react/macro';
import { IconSettings, TintedIconTile } from 'twenty-ui/display';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelObjectPickerItem } from '@/navigation-menu-item/edit/side-panel/components/SidePanelObjectPickerItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SidePanelAddToNavigationDroppable } from '@/side-panel/components/SidePanelAddToNavigationDroppable';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelSubViewWithSearch } from '@/side-panel/components/SidePanelSubViewWithSearch';
import { useSidePanelFilteredPickerItems } from '@/side-panel/hooks/useSidePanelFilteredPickerItems';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SidePanelObjectPickerSubViewProps = {
  objects: EnrichedObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onOpenSystemPicker: () => void;
  isViewItem: boolean;
  onSelectObjectForViewEdit?: (
    objectMetadataItem: EnrichedObjectMetadataItem,
  ) => void;
  onChangeObject: (objectMetadataItem: EnrichedObjectMetadataItem) => void;
  objectMenuItemVariant?: 'add' | 'edit';
  emptyNoResultsText?: string;
  disableDrag?: boolean;
};

export const SidePanelObjectPickerSubView = ({
  objects,
  searchValue,
  onSearchChange,
  onOpenSystemPicker,
  isViewItem,
  onSelectObjectForViewEdit,
  onChangeObject,
  objectMenuItemVariant = 'edit',
  emptyNoResultsText,
  disableDrag = false,
}: SidePanelObjectPickerSubViewProps) => {
  const { t } = useLingui();
  const { filteredItems, selectableItemIds, isEmpty, hasSearchQuery } =
    useSidePanelFilteredPickerItems({
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
    <SidePanelGroup heading={t`Objects`}>
      {filteredItems.map((objectMetadataItem, index) => (
        <SidePanelObjectPickerItem
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
      <SelectableListItem itemId="system" onEnter={onOpenSystemPicker}>
        <CommandMenuItem
          Icon={() => <TintedIconTile Icon={IconSettings} />}
          label={t`System objects`}
          id="system"
          hasSubMenu
          onClick={onOpenSystemPicker}
        />
      </SelectableListItem>
    </SidePanelGroup>
  );

  return (
    <SidePanelSubViewWithSearch
      searchPlaceholder={t`Search an object...`}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
    >
      {isAddVariant ? (
        <SidePanelAddToNavigationDroppable>
          {({ innerRef, droppableProps, placeholder }) => (
            <SidePanelList
              selectableItemIds={selectableItemIds}
              noResults={isEmpty}
              noResultsText={noResultsText}
            >
              {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
              <div ref={innerRef} {...droppableProps}>
                {listContent}
                {placeholder}
              </div>
            </SidePanelList>
          )}
        </SidePanelAddToNavigationDroppable>
      ) : (
        <SidePanelList
          selectableItemIds={selectableItemIds}
          noResults={isEmpty}
          noResultsText={noResultsText}
        >
          {listContent}
        </SidePanelList>
      )}
    </SidePanelSubViewWithSearch>
  );
};
