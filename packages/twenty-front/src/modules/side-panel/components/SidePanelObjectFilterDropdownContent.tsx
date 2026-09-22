import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { OBJECT_FILTER_DROPDOWN_ID } from '@/side-panel/components/SidePanelObjectFilterDropdown';
import { sidePanelShowHiddenObjectsState } from '@/side-panel/states/sidePanelShowHiddenObjectsState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { OBJECTS_WITH_CHANNEL_VISIBILITY_CONSTRAINTS } from 'twenty-shared/constants';
import { SettingsRow, TintedIconTile } from 'twenty-ui/components';
import { IconCube } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

const ALL_OBJECTS_ITEM_ID = 'all-objects';

type SidePanelObjectFilterDropdownContentProps = {
  selectedObjectNameSingular: string | null;
  onSelectObject: (objectNameSingular: string | null) => void;
};

export const SidePanelObjectFilterDropdownContent = ({
  selectedObjectNameSingular,
  onSelectObject,
}: SidePanelObjectFilterDropdownContentProps) => {
  const { t } = useLingui();
  const [filterSearch, setFilterSearch] = useState('');
  const [sidePanelShowHiddenObjects, setSidePanelShowHiddenObjects] =
    useAtomState(sidePanelShowHiddenObjectsState);
  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();
  const { closeDropdown } = useCloseDropdown();

  const searchFilter = filterSearch.toLowerCase();

  const displayedObjects = readableObjectMetadataItems.filter((item) => {
    if (
      OBJECTS_WITH_CHANNEL_VISIBILITY_CONSTRAINTS.includes(
        item.nameSingular as (typeof OBJECTS_WITH_CHANNEL_VISIBILITY_CONSTRAINTS)[number],
      )
    ) {
      return false;
    }

    if (!sidePanelShowHiddenObjects && !item.isSearchable) {
      return false;
    }

    return item.labelPlural.toLowerCase().includes(searchFilter);
  });

  const handleSelect = (objectNameSingular: string | null) => {
    onSelectObject(objectNameSingular);
    closeDropdown(OBJECT_FILTER_DROPDOWN_ID);
  };

  const selectableItemIdArray = [
    ALL_OBJECTS_ITEM_ID,
    ...displayedObjects.map((item) => item.nameSingular),
  ];

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    OBJECT_FILTER_DROPDOWN_ID,
  );

  return (
    <DropdownContent>
      <DropdownMenuHeader>{t`Object`}</DropdownMenuHeader>
      <DropdownMenuSearchInput
        value={filterSearch}
        onChange={(event) => setFilterSearch(event.target.value)}
        autoFocus
      />
      <DropdownMenuSeparator />
      <SelectableList
        selectableListInstanceId={OBJECT_FILTER_DROPDOWN_ID}
        focusId={OBJECT_FILTER_DROPDOWN_ID}
        selectableItemIdArray={selectableItemIdArray}
      >
        <DropdownMenuItemsContainer hasMaxHeight>
          <SelectableListItem
            itemId={ALL_OBJECTS_ITEM_ID}
            onEnter={() => handleSelect(null)}
          >
            <ListItem
              onClick={() => handleSelect(null)}
              focused={selectedItemId === ALL_OBJECTS_ITEM_ID}
              role="option"
              aria-selected={selectedObjectNameSingular === null}
              selected={selectedObjectNameSingular === null}
              indicator="check"
              startIcon={<TintedIconTile Icon={IconCube} />}
            >{t`All objects`}</ListItem>
          </SelectableListItem>
          {displayedObjects.map((objectMetadataItem) => {
            return (
              <SelectableListItem
                key={objectMetadataItem.id}
                itemId={objectMetadataItem.nameSingular}
                onEnter={() => handleSelect(objectMetadataItem.nameSingular)}
              >
                <ListItem
                  onClick={() => handleSelect(objectMetadataItem.nameSingular)}
                  focused={selectedItemId === objectMetadataItem.nameSingular}
                  role="option"
                  aria-selected={
                    selectedObjectNameSingular ===
                    objectMetadataItem.nameSingular
                  }
                  selected={
                    selectedObjectNameSingular ===
                    objectMetadataItem.nameSingular
                  }
                  indicator="check"
                  startIcon={
                    <ObjectMetadataIcon
                      objectMetadataItem={objectMetadataItem}
                    />
                  }
                >
                  {objectMetadataItem.labelPlural}
                </ListItem>
              </SelectableListItem>
            );
          })}
        </DropdownMenuItemsContainer>
      </SelectableList>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <SettingsRow
          startIcon={<IconCube />}
          onCheckedChange={() =>
            setSidePanelShowHiddenObjects(!sidePanelShowHiddenObjects)
          }
          checked={sidePanelShowHiddenObjects}
        >{t`Show hidden objects`}</SettingsRow>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
