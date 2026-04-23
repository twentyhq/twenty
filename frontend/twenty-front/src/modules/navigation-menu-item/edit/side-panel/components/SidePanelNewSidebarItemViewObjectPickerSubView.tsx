import { useLingui } from '@lingui/react/macro';
import { IconSettings, useIcons } from 'twenty-ui/display';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelSubViewWithSearch } from '@/side-panel/components/SidePanelSubViewWithSearch';
import { useSidePanelFilteredPickerItems } from '@/side-panel/hooks/useSidePanelFilteredPickerItems';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SidePanelNewSidebarItemViewObjectPickerSubViewProps = {
  objects: EnrichedObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onOpenSystemPicker: () => void;
  onSelectObject: (objectMetadataItem: EnrichedObjectMetadataItem) => void;
  showSystemObjectsOption?: boolean;
};

export const SidePanelNewSidebarItemViewObjectPickerSubView = ({
  objects,
  searchValue,
  onSearchChange,
  onOpenSystemPicker,
  onSelectObject,
  showSystemObjectsOption = true,
}: SidePanelNewSidebarItemViewObjectPickerSubViewProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { filteredItems, selectableItemIds, isEmpty, hasSearchQuery } =
    useSidePanelFilteredPickerItems({
      items: objects,
      searchQuery: searchValue,
      getSearchableValues: (item) => [item.labelPlural],
      appendSelectableIds: showSystemObjectsOption ? ['system'] : [],
    });
  const noResultsText = hasSearchQuery
    ? t`No results found`
    : t`No objects with views found`;

  return (
    <SidePanelSubViewWithSearch
      searchPlaceholder={t`Search an object...`}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
    >
      <SidePanelList
        commandGroups={[]}
        selectableItemIds={selectableItemIds}
        noResults={isEmpty}
        noResultsText={noResultsText}
      >
        <SidePanelGroup heading={t`Objects`}>
          {filteredItems.map((objectMetadataItem) => (
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
                hasSubMenu
                onClick={() => onSelectObject(objectMetadataItem)}
              />
            </SelectableListItem>
          ))}
          {showSystemObjectsOption && (
            <SelectableListItem itemId="system" onEnter={onOpenSystemPicker}>
              <CommandMenuItem
                Icon={() => <NavigationMenuItemStyleIcon Icon={IconSettings} />}
                label={t`System objects`}
                id="system"
                hasSubMenu={true}
                onClick={onOpenSystemPicker}
              />
            </SelectableListItem>
          )}
        </SidePanelGroup>
      </SidePanelList>
    </SidePanelSubViewWithSearch>
  );
};
