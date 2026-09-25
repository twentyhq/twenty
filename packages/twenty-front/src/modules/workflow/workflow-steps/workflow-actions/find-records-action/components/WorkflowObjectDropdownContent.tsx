import { ListItem } from 'twenty-ui/primitives/navigation';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useState } from 'react';

type WorkflowObjectDropdownContentProps = {
  dropdownId: string;
  onOptionClick: (value: string) => void;
};

export const WorkflowObjectDropdownContent = ({
  dropdownId,
  onOptionClick,
}: WorkflowObjectDropdownContentProps) => {
  const [searchInputValue, setSearchInputValue] = useState('');

  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const nonSystemObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) =>
      objectMetadataItem.isActive === true &&
      objectMetadataItem.isSystem === false,
  );
  const systemObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) =>
      objectMetadataItem.isActive === true &&
      objectMetadataItem.isSystem === true,
  );

  const matchesSearchFilter = (
    objectMetadataItem: (typeof objectMetadataItems)[number],
    searchInputLowerCase: string,
  ) => {
    return (
      objectMetadataItem.nameSingular
        .toLowerCase()
        .includes(searchInputLowerCase) ||
      objectMetadataItem.labelSingular
        .toLowerCase()
        .includes(searchInputLowerCase) ||
      objectMetadataItem.labelPlural
        .toLowerCase()
        .includes(searchInputLowerCase)
    );
  };

  const searchInputLowerCase = searchInputValue.toLowerCase();

  const filteredNonSystemObjects = nonSystemObjectMetadataItems.filter(
    (objectMetadataItem) =>
      matchesSearchFilter(objectMetadataItem, searchInputLowerCase),
  );

  const filteredSystemObjects = systemObjectMetadataItems.filter(
    (objectMetadataItem) =>
      matchesSearchFilter(objectMetadataItem, searchInputLowerCase),
  );

  const filteredObjects = [
    ...filteredNonSystemObjects,
    ...filteredSystemObjects,
  ];

  const selectableItemIdArray = filteredObjects.map(
    (objectMetadataItem) => objectMetadataItem.nameSingular,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchInputValue(event.target.value);
  };

  return (
    <LegacyDropdownContent
      widthInPixels={GenericDropdownContentWidth.ExtraLarge}
    >
      <DropdownMenuSearchInput
        autoFocus
        value={searchInputValue}
        onChange={handleSearchInputChange}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={selectableItemIdArray}
        >
          {filteredObjects.map((objectMetadataItem) => (
            <SelectableListItem
              key={objectMetadataItem.nameSingular}
              itemId={objectMetadataItem.nameSingular}
              onEnter={() => onOptionClick(objectMetadataItem.nameSingular)}
            >
              <ListItem
                focused={selectedItemId === objectMetadataItem.nameSingular}
                startIcon={
                  <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
                }
                onClick={() => onOptionClick(objectMetadataItem.nameSingular)}
              >
                {objectMetadataItem.labelPlural}
              </ListItem>
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </LegacyDropdownContent>
  );
};
