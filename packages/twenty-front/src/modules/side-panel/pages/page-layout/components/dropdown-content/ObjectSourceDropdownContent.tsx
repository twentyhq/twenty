import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { filterReadableActiveObjectMetadataItems } from '@/object-metadata/utils/filterReadableActiveObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type ObjectSourceDropdownContentProps = {
  selectedObjectMetadataItemId?: string | null;
  onSelect: (objectMetadataItemId: string) => void;
};

export const ObjectSourceDropdownContent = ({
  selectedObjectMetadataItemId,
  onSelect,
}: ObjectSourceDropdownContentProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const objectsWithReadAccess = filterReadableActiveObjectMetadataItems(
    objectMetadataItems,
    objectPermissionsByObjectMetadataId,
  ).filter((objectMetadataItem) => !objectMetadataItem.isSystem);

  const sortedObjects = objectsWithReadAccess.sort((first, second) =>
    first.labelPlural.localeCompare(second.labelPlural),
  );

  const filteredObjects = filterBySearchQuery({
    items: sortedObjects,
    searchQuery,
    getSearchableValues: (item) => [item.labelPlural, item.namePlural],
  });

  return (
    <>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search objects`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={filteredObjects.map(
            (objectMetadataItem) => objectMetadataItem.id,
          )}
        >
          {filteredObjects.map((objectMetadataItem) => (
            <SelectableListItem
              key={objectMetadataItem.id}
              itemId={objectMetadataItem.id}
              onEnter={() => {
                onSelect(objectMetadataItem.id);
              }}
            >
              <ListItemButton
                focused={selectedItemId === objectMetadataItem.id}
                onClick={() => {
                  onSelect(objectMetadataItem.id);
                }}
                role="option"
                aria-selected={
                  selectedObjectMetadataItemId === objectMetadataItem.id
                }
                selected={
                  selectedObjectMetadataItemId === objectMetadataItem.id
                }
                indicator="check"
                startIcon={
                  <SelectOptionIcon
                    Icon={() => (
                      <ObjectMetadataIcon
                        objectMetadataItem={objectMetadataItem}
                      />
                    )}
                  />
                }
              >
                {objectMetadataItem.labelPlural}
              </ListItemButton>
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
