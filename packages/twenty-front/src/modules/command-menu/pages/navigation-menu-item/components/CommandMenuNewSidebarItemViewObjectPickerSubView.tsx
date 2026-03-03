import { useLingui } from '@lingui/react/macro';
import { IconSettings, useIcons } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { useFilteredPickerItems } from '@/command-menu/hooks/useFilteredPickerItems';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { getStandardObjectIconColor } from '@/navigation-menu-item/utils/getStandardObjectIconColor';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CommandMenuNewSidebarItemViewObjectPickerSubViewProps = {
  objects: ObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onOpenSystemPicker: () => void;
  onSelectObject: (objectMetadataItem: ObjectMetadataItem) => void;
  showSystemObjectsOption?: boolean;
};

export const CommandMenuNewSidebarItemViewObjectPickerSubView = ({
  objects,
  searchValue,
  onSearchChange,
  onBack,
  onOpenSystemPicker,
  onSelectObject,
  showSystemObjectsOption = true,
}: CommandMenuNewSidebarItemViewObjectPickerSubViewProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { filteredItems, selectableItemIds, isEmpty, hasSearchQuery } =
    useFilteredPickerItems({
      items: objects,
      searchQuery: searchValue,
      getSearchableValues: (item) => [item.labelPlural],
      appendSelectableIds: showSystemObjectsOption ? ['system'] : [],
    });
  const noResultsText = hasSearchQuery
    ? t`No results found`
    : t`No objects with views found`;

  return (
    <CommandMenuSubViewWithSearch
      backBarTitle={t`Pick an object`}
      onBack={onBack}
      searchPlaceholder={t`Search an object...`}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
    >
      <CommandMenuList
        commandGroups={[]}
        selectableItemIds={selectableItemIds}
        noResults={isEmpty}
        noResultsText={noResultsText}
      >
        <CommandGroup heading={t`Objects`}>
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
        </CommandGroup>
      </CommandMenuList>
    </CommandMenuSubViewWithSearch>
  );
};
