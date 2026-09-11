import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useRecordTableWidgetLayoutCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { isFieldMetadataItemAvailableAsWidgetGroupByField } from '@/page-layout/widgets/record-table/utils/isFieldMetadataItemAvailableAsWidgetGroupByField';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

const NO_GROUP_BY_ITEM_ID = 'no-group-by';

type RecordTableGroupByDropdownContentProps = {
  pageLayoutId: string;
  widgetId: string;
  objectMetadataId: string;
  currentMainGroupByFieldMetadataId: string | null;
  isClearable?: boolean;
};

export const RecordTableGroupByDropdownContent = ({
  pageLayoutId,
  widgetId,
  objectMetadataId,
  currentMainGroupByFieldMetadataId,
  isClearable = true,
}: RecordTableGroupByDropdownContentProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { getIcon } = useIcons();

  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItemToFind) =>
      objectMetadataItemToFind.id === objectMetadataId,
  );

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { closeDropdown } = useCloseDropdown();

  const { handleGroupByFieldChange } = useRecordTableWidgetLayoutCallbacks({
    pageLayoutId,
    widgetId,
  });

  const groupableFields = (objectMetadataItem?.readableFields ?? []).filter(
    isFieldMetadataItemAvailableAsWidgetGroupByField,
  );

  const filteredFields = filterBySearchQuery({
    items: groupableFields,
    searchQuery,
    getSearchableValues: (fieldMetadataItem) => [fieldMetadataItem.label],
  });

  const selectableItemIds = [
    ...(isClearable ? [NO_GROUP_BY_ITEM_ID] : []),
    ...filteredFields.map((fieldMetadataItem) => fieldMetadataItem.id),
  ];

  return (
    <>
      <DropdownMenuSearchInput
        autoFocus
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        <SelectableList
          selectableListInstanceId={dropdownId}
          selectableItemIdArray={selectableItemIds}
          focusId={dropdownId}
        >
          {isClearable && (
            <SelectableListItem
              itemId={NO_GROUP_BY_ITEM_ID}
              onEnter={() => {
                handleGroupByFieldChange(null);
                closeDropdown();
              }}
            >
              <MenuItemSelect
                text={t`None`}
                selected={!isDefined(currentMainGroupByFieldMetadataId)}
                focused={selectedItemId === NO_GROUP_BY_ITEM_ID}
                onClick={() => {
                  handleGroupByFieldChange(null);
                  closeDropdown();
                }}
              />
            </SelectableListItem>
          )}
          {filteredFields.map((fieldMetadataItem) => (
            <SelectableListItem
              key={fieldMetadataItem.id}
              itemId={fieldMetadataItem.id}
              onEnter={() => {
                handleGroupByFieldChange(fieldMetadataItem);
                closeDropdown();
              }}
            >
              <MenuItemSelect
                text={fieldMetadataItem.label}
                LeftIcon={getIcon(fieldMetadataItem.icon)}
                selected={
                  currentMainGroupByFieldMetadataId === fieldMetadataItem.id
                }
                focused={selectedItemId === fieldMetadataItem.id}
                onClick={() => {
                  handleGroupByFieldChange(fieldMetadataItem);
                  closeDropdown();
                }}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
