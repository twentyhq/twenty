import { useLingui } from '@lingui/react/macro';
import { useIcons } from 'twenty-ui/display';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelSubViewWithSearch } from '@/side-panel/components/SidePanelSubViewWithSearch';
import { useSidePanelFilteredPickerItems } from '@/side-panel/hooks/useSidePanelFilteredPickerItems';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SidePanelNewSidebarItemViewSystemSubViewProps = {
  systemObjects: EnrichedObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSelectObject: (objectMetadataItem: EnrichedObjectMetadataItem) => void;
};

export const SidePanelNewSidebarItemViewSystemSubView = ({
  systemObjects,
  searchValue,
  onSearchChange,
  onSelectObject,
}: SidePanelNewSidebarItemViewSystemSubViewProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const {
    filteredItems: filteredSystemObjectMetadataItems,
    selectableItemIds,
    isEmpty,
    hasSearchQuery,
  } = useSidePanelFilteredPickerItems({
    items: systemObjects,
    searchQuery: searchValue,
    getSearchableValues: (item) => [item.labelPlural],
  });
  const noResultsText = hasSearchQuery
    ? t`No results found`
    : t`No system objects with views found`;

  return (
    <SidePanelSubViewWithSearch
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
          {filteredSystemObjectMetadataItems.map((objectMetadataItem) => (
            <SelectableListItem
              key={objectMetadataItem.id}
              itemId={objectMetadataItem.id}
              onEnter={() => onSelectObject(objectMetadataItem)}
            >
              <CommandMenuItem
                Icon={() => (
                  <NavigationMenuItemStyleIcon
                    Icon={getIcon(objectMetadataItem.icon)}
                    color={getObjectColorWithFallback(objectMetadataItem)}
                  />
                )}
                label={objectMetadataItem.labelPlural}
                id={objectMetadataItem.id}
                onClick={() => onSelectObject(objectMetadataItem)}
              />
            </SelectableListItem>
          ))}
        </SidePanelGroup>
      </SidePanelList>
    </SidePanelSubViewWithSearch>
  );
};
