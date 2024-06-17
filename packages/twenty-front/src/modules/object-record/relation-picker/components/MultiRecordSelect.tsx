import { useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';

import { objectRecordsIdsMultiSelectState } from '@/activities/states/objectRecordsIdsMultiSelectState';
import { MultipleObjectRecordOnClickOutsideEffect } from '@/object-record/relation-picker/components/MultipleObjectRecordOnClickOutsideEffect';
import { MultipleObjectRecordSelectItem } from '@/object-record/relation-picker/components/MultipleObjectRecordSelectItem';
import { MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID } from '@/object-record/relation-picker/constants/MultiObjectRecordSelectSelectableListId';
import { useRelationPickerScopedStates } from '@/object-record/relation-picker/hooks/internal/useRelationPickerScopedStates';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
`;
export const MultiRecordSelect = ({
  onChange,
  onSubmit,
  loading, // put in state
}: {
  onChange?: (
    changedRecordForSelectId: string,
    newSelectedValue: boolean,
  ) => void;
  onSubmit?: () => void;
  loading: boolean;
}) => {
  console.log('MultiRecordSelect rerender');
  const containerRef = useRef<HTMLDivElement>(null);

  const objectRecordsIdsMultiSelect = useRecoilValue(
    objectRecordsIdsMultiSelectState,
  ); // TO DO conflict beween multiple selects states, need to have an independent state for each select

  const { relationPickerSearchFilterState } = useRelationPickerScopedStates();

  const setSearchFilter = useSetRecoilState(relationPickerSearchFilterState);
  const relationPickerSearchFilter = useRecoilValue(
    relationPickerSearchFilterState,
  );
  const debouncedSetSearchFilter = useDebouncedCallback(setSearchFilter, 100, {
    leading: true,
  });

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSetSearchFilter(event.currentTarget.value);
    },
    [debouncedSetSearchFilter],
  );
  return (
    <>
      <MultipleObjectRecordOnClickOutsideEffect
        containerRef={containerRef}
        onClickOutside={() => {
          onSubmit?.();
        }}
      />
      <DropdownMenu ref={containerRef} data-select-disable>
        <DropdownMenuSearchInput
          value={relationPickerSearchFilter}
          onChange={handleFilterChange}
          autoFocus
        />
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer hasMaxHeight>
          {/* {loading ? (
            <MenuItem text="Loading..." />
          ) : ( */}
          <>
            <SelectableList
              selectableListId={MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID}
              selectableItemIdArray={objectRecordsIdsMultiSelect}
              hotkeyScope={RelationPickerHotkeyScope.RelationPicker}
            >
              {objectRecordsIdsMultiSelect?.map((recordId) => {
                return (
                  <div key={recordId}>
                    <MultipleObjectRecordSelectItem
                      key={recordId}
                      objectRecordId={recordId}
                      onChange={onChange}
                    />
                  </div>
                );
              })}
            </SelectableList>
            {objectRecordsIdsMultiSelect?.length === 0 && (
              <MenuItem text="No result" />
            )}
          </>
          {/* )} */}
        </DropdownMenuItemsContainer>
      </DropdownMenu>
    </>
  );
};
