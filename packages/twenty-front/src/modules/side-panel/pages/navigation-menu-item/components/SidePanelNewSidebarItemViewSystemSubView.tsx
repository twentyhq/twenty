import { useLingui } from '@lingui/react/macro';
import { useIcons } from 'twenty-ui/display';

import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelSubViewWithSearch } from '@/side-panel/components/SidePanelSubViewWithSearch';
import { useSidePanelFilteredPickerItems } from '@/side-panel/hooks/useSidePanelFilteredPickerItems';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { getStandardObjectIconColor } from '@/navigation-menu-item/utils/getStandardObjectIconColor';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SidePanelNewSidebarItemViewSystemSubViewProps = {
  systemObjects: ObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onSelectObject: (objectMetadataItem: ObjectMetadataItem) => void;
};

export const SidePanelNewSidebarItemViewSystemSubView = ({
  systemObjects,
  searchValue,
  onSearchChange,
  onBack,
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
                    color={getStandardObjectIconColor(
                      objectMetadataItem.nameSingular,
                    )}
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
