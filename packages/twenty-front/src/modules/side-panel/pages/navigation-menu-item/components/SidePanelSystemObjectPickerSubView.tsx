import { useLingui } from '@lingui/react/macro';

import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelObjectPickerItem } from '@/side-panel/pages/navigation-menu-item/components/SidePanelObjectPickerItem';
import { SidePanelSubViewWithSearch } from '@/side-panel/components/SidePanelSubViewWithSearch';
import { useSidePanelFilteredPickerItems } from '@/side-panel/hooks/useSidePanelFilteredPickerItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

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

  return (
    <SidePanelSubViewWithSearch
      backBarTitle={t`System objects`}
      onBack={onBack}
      searchPlaceholder={t`Search a system object...`}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
    >
      <SidePanelList
        commandGroups={[]}
        selectableItemIds={selectableItemIds}
        noResults={isEmpty}
        noResultsText={noResultsText}
      >
        <SidePanelGroup heading={t`System objects`}>
          {filteredItems.map((objectMetadataItem) => (
            <SidePanelObjectPickerItem
              key={objectMetadataItem.id}
              objectMetadataItem={objectMetadataItem}
              isViewItem={isViewItem}
              onSelectObjectForViewEdit={onSelectObjectForViewEdit}
              onChangeObject={onChangeObject}
              objectMenuItemVariant={objectMenuItemVariant}
            />
          ))}
        </SidePanelGroup>
      </SidePanelList>
    </SidePanelSubViewWithSearch>
  );
};
