import { useLingui } from '@lingui/react/macro';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SidePanelAddToNavigationDroppable } from '@/side-panel/components/SidePanelAddToNavigationDroppable';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelSubViewWithSearch } from '@/side-panel/components/SidePanelSubViewWithSearch';
import { useSidePanelFilteredPickerItems } from '@/side-panel/hooks/useSidePanelFilteredPickerItems';
import { SidePanelObjectPickerItem } from '@/side-panel/pages/navigation-menu-item/components/SidePanelObjectPickerItem';

type SidePanelSystemObjectPickerSubViewProps = {
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

export const SidePanelSystemObjectPickerSubView = ({
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
      backBarTitle={t`System objects`}
      onBack={onBack}
      searchPlaceholder={t`Search a system object...`}
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
