import { useLingui } from '@lingui/react/macro';
import { IconSettings, useIcons } from 'twenty-ui/display';

import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelSubViewWithSearch } from '@/side-panel/components/SidePanelSubViewWithSearch';
import { useSidePanelFilteredPickerItems } from '@/side-panel/hooks/useSidePanelFilteredPickerItems';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { getStandardObjectIconColor } from '@/navigation-menu-item/utils/getStandardObjectIconColor';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SidePanelNewSidebarItemViewObjectPickerSubViewProps = {
  objects: ObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onOpenSystemPicker: () => void;
  onSelectObject: (objectMetadataItem: ObjectMetadataItem) => void;
  showSystemObjectsOption?: boolean;
};

export const SidePanelNewSidebarItemViewObjectPickerSubView = ({
  objects,
  searchValue,
  onSearchChange,
  onBack,
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
      backBarTitle={t`Pick an object`}
      onBack={onBack}
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
                    color={getStandardObjectIconColor(
                      objectMetadataItem.nameSingular,
                    )}
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
