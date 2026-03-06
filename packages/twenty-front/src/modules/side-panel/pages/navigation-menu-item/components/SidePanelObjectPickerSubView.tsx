import { useLingui } from '@lingui/react/macro';
import { IconSettings } from 'twenty-ui/display';

import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelAddToNavigationDraggablePlaceholder } from '@/side-panel/components/SidePanelAddToNavigationDraggablePlaceholder';
import { SidePanelAddToNavigationDroppable } from '@/side-panel/components/SidePanelAddToNavigationDroppable';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelSubViewWithSearch } from '@/side-panel/components/SidePanelSubViewWithSearch';
import { useSidePanelFilteredPickerItems } from '@/side-panel/hooks/useSidePanelFilteredPickerItems';
import { SidePanelObjectPickerItem } from '@/side-panel/pages/navigation-menu-item/components/SidePanelObjectPickerItem';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SidePanelObjectPickerSubViewProps = {
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

export const SidePanelObjectPickerSubView = ({
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
          dragIndex={isAddVariant ? index : undefined}
        />
      ))}
      {isAddVariant ? (
        <SidePanelAddToNavigationDraggablePlaceholder
          index={filteredItems.length}
        >
          <SelectableListItem itemId="system" onEnter={onOpenSystemPicker}>
            <CommandMenuItem
              Icon={() => <NavigationMenuItemStyleIcon Icon={IconSettings} />}
              label={t`System objects`}
              id="system"
              hasSubMenu
              onClick={onOpenSystemPicker}
            />
          </SelectableListItem>
        </SidePanelAddToNavigationDraggablePlaceholder>
      ) : (
        <SelectableListItem itemId="system" onEnter={onOpenSystemPicker}>
          <CommandMenuItem
            Icon={() => <NavigationMenuItemStyleIcon Icon={IconSettings} />}
            label={t`System objects`}
            id="system"
            hasSubMenu
            onClick={onOpenSystemPicker}
          />
        </SelectableListItem>
      )}
    </SidePanelGroup>
  );

  return (
    <SidePanelSubViewWithSearch
      backBarTitle={t`Pick an object`}
      onBack={onBack}
      searchPlaceholder={t`Search an object...`}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
    >
      {isAddVariant ? (
        <SidePanelAddToNavigationDroppable>
          {({ innerRef, droppableProps, placeholder }) => (
            <SidePanelList
              commandGroups={[]}
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
          commandGroups={[]}
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
