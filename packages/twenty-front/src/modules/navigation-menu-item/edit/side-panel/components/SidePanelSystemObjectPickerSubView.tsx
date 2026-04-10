import { useLingui } from '@lingui/react/macro';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SidePanelAddToNavigationDroppable } from '@/side-panel/components/SidePanelAddToNavigationDroppable';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelSubViewWithSearch } from '@/side-panel/components/SidePanelSubViewWithSearch';
import { useSidePanelFilteredPickerItems } from '@/side-panel/hooks/useSidePanelFilteredPickerItems';
import { SidePanelObjectPickerItem } from '@/navigation-menu-item/edit/side-panel/components/SidePanelObjectPickerItem';

type SidePanelSystemObjectPickerSubViewProps = {
  systemObjects: EnrichedObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  isViewItem: boolean;
  onSelectObjectForViewEdit?: (
    objectMetadataItem: EnrichedObjectMetadataItem,
  ) => void;
  onChangeObject: (objectMetadataItem: EnrichedObjectMetadataItem) => void;
  objectMenuItemVariant?: 'add' | 'edit';
  emptyNoResultsText?: string;
  disableDrag?: boolean;
};

export const SidePanelSystemObjectPickerSubView = ({
  systemObjects,
  searchValue,
  onSearchChange,
  isViewItem,
  onSelectObjectForViewEdit,
  onChangeObject,
  objectMenuItemVariant = 'edit',
  emptyNoResultsText,
  disableDrag = false,
}: SidePanelSystemObjectPickerSubViewProps) => {
  const { t } = useLingui();
  const { filteredItems, selectableItemIds, isEmpty, hasSearchQuery } =
    useSidePanelFilteredPickerItems({
      items: systemObjects,
      searchQuery: searchValue,
      getSearchableValues: (item) => [item.labelPlural],
    });

  const noResultsText = hasSearchQuery
    ? t`No results found`
    : (emptyNoResultsText ?? t`No system objects available`);

  const isAddVariant = objectMenuItemVariant === 'add';

  const listContent = (
    <SidePanelGroup heading={t`System objects`}>
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
    </SidePanelGroup>
  );

  return (
    <SidePanelSubViewWithSearch
      searchPlaceholder={t`Search a system object...`}
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
              {/* eslint-disable-next-line react/jsx-props-no-spreading */}
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
