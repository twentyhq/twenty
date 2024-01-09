import { useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import debounce from 'lodash.debounce';
import { v4 } from 'uuid';

import {
  ObjectRecordForSelect,
  SelectedObjectRecordId,
  useMultiObjectSearch,
} from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemMultiSelectAvatar } from '@/ui/navigation/menu-item/components/MenuItemMultiSelectAvatar';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { Avatar } from '@/users/components/Avatar';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
`;

export type EntitiesForMultipleObjectRecordSelect = {
  filteredSelectedObjectRecords: ObjectRecordForSelect[];
  objectRecordsToSelect: ObjectRecordForSelect[];
  loading: boolean;
};

export const MultipleObjectRecordSelect = ({
  onChange,
  onSubmit,
  selectedObjectRecordIds,
}: {
  onChange?: (
    changedRecordForSelect: ObjectRecordForSelect,
    newSelectedValue: boolean,
  ) => void;
  onCancel?: (objectRecordsForSelect: ObjectRecordForSelect[]) => void;
  onSubmit?: (objectRecordsForSelect: ObjectRecordForSelect[]) => void;
  selectedObjectRecordIds: SelectedObjectRecordId[];
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [searchFilter, setSearchFilter] = useState<string>('');

  const {
    filteredSelectedObjectRecords,
    loading,
    objectRecordsToSelect,
    selectedObjectRecords,
  } = useMultiObjectSearch({
    searchFilterValue: searchFilter,
    selectedObjectRecordIds,
    excludedObjectRecordIds: [],
    limit: 10,
  });

  const selectedObjectRecordsForSelect = useMemo(
    () =>
      selectedObjectRecords.filter((selectedObjectRecord) =>
        selectedObjectRecordIds.some(
          (selectedObjectRecordId) =>
            selectedObjectRecordId.id ===
            selectedObjectRecord.recordIdentifier.id,
        ),
      ),
    [selectedObjectRecords, selectedObjectRecordIds],
  );

  const [internalSelectedRecords, setInternalSelectedRecords] = useState<
    ObjectRecordForSelect[]
  >([]);

  useEffect(() => {
    if (!loading) {
      setInternalSelectedRecords(selectedObjectRecordsForSelect);
    }
  }, [selectedObjectRecordsForSelect, loading]);

  const debouncedSetSearchFilter = debounce(setSearchFilter, 100, {
    leading: true,
  });

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchFilter(event.currentTarget.value);
  };

  const handleSelectChange = (
    changedRecordForSelect: ObjectRecordForSelect,
    newSelectedValue: boolean,
  ) => {
    const newSelectedRecords = newSelectedValue
      ? [...internalSelectedRecords, changedRecordForSelect]
      : internalSelectedRecords.filter(
          (selectedRecord) =>
            selectedRecord.record.id !== changedRecordForSelect.record.id,
        );

    setInternalSelectedRecords(newSelectedRecords);

    onChange?.(changedRecordForSelect, newSelectedValue);
  };

  const entitiesInDropdown = useMemo(
    () =>
      [
        ...(filteredSelectedObjectRecords ?? []),
        ...(objectRecordsToSelect ?? []),
      ].filter((entity) => isNonEmptyString(entity.recordIdentifier.id)),
    [filteredSelectedObjectRecords, objectRecordsToSelect],
  );

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();

      onSubmit?.(internalSelectedRecords);
    },
  });

  const selectableItemIds = entitiesInDropdown.map(
    (entity) => entity.record.id,
  );

  return (
    <DropdownMenu ref={containerRef} data-select-disable>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={handleFilterChange}
        autoFocus
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {loading ? (
          <MenuItem text="Loading..." />
        ) : (
          <>
            <SelectableList
              selectableListId="multiple-entity-select-list"
              selectableItemIdArray={selectableItemIds}
              hotkeyScope={RelationPickerHotkeyScope.RelationPicker}
              onEnter={(recordId) => {
                const recordIsSelected = internalSelectedRecords?.some(
                  (selectedRecord) => selectedRecord.record.id === recordId,
                );

                const correspondingRecordForSelect = entitiesInDropdown?.find(
                  (entity) => entity.record.id === recordId,
                );

                if (correspondingRecordForSelect) {
                  handleSelectChange(
                    correspondingRecordForSelect,
                    !recordIsSelected,
                  );
                }
              }}
            >
              {entitiesInDropdown?.map((objectRecordForSelect) => (
                <StyledSelectableItem
                  itemId={objectRecordForSelect.record.id}
                  key={objectRecordForSelect.record.id + v4()}
                >
                  <MenuItemMultiSelectAvatar
                    selected={internalSelectedRecords?.some(
                      (selectedRecord) => {
                        return (
                          selectedRecord.record.id ===
                          objectRecordForSelect.record.id
                        );
                      },
                    )}
                    onSelectChange={(newCheckedValue) =>
                      handleSelectChange(objectRecordForSelect, newCheckedValue)
                    }
                    avatar={
                      <Avatar
                        avatarUrl={
                          objectRecordForSelect.recordIdentifier.avatarUrl
                        }
                        colorId={objectRecordForSelect.record.id}
                        placeholder={
                          objectRecordForSelect.recordIdentifier.name
                        }
                        size="md"
                        type={
                          objectRecordForSelect.recordIdentifier.avatarType ??
                          'rounded'
                        }
                      />
                    }
                    text={objectRecordForSelect.recordIdentifier.name}
                  />
                </StyledSelectableItem>
              ))}
            </SelectableList>
            {entitiesInDropdown?.length === 0 && <MenuItem text="No result" />}
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  );
};
