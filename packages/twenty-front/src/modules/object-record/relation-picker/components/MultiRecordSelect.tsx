import { useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';

import { useObjectRecordMultiSelectScopedStates } from '@/activities/hooks/useObjectRecordMultiSelectScopedStates';
import { MultipleObjectRecordOnClickOutsideEffect } from '@/object-record/relation-picker/components/MultipleObjectRecordOnClickOutsideEffect';
import { MultipleObjectRecordSelectItem } from '@/object-record/relation-picker/components/MultipleObjectRecordSelectItem';
import { MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID } from '@/object-record/relation-picker/constants/MultiObjectRecordSelectSelectableListId';
import { useRelationPickerScopedStates } from '@/object-record/relation-picker/hooks/internal/useRelationPickerScopedStates';
import { RelationPickerScopeInternalContext } from '@/object-record/relation-picker/scopes/scope-internal-context/RelationPickerScopeInternalContext';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
`;
export const MultiRecordSelect = ({
  onChange,
  onSubmit,
}: {
  onChange?: (changedRecordForSelectId: string) => void;
  onSubmit?: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const relationPickerScopedId = useAvailableScopeIdOrThrow(
    RelationPickerScopeInternalContext,
  );

  const { objectRecordsIdsMultiSelectState, recordMultiSelectIsLoadingState } =
    useObjectRecordMultiSelectScopedStates(relationPickerScopedId);

  const recordMultiSelectIsLoading = useRecoilValue(
    recordMultiSelectIsLoadingState,
  );
  const objectRecordsIdsMultiSelect = useRecoilValue(
    objectRecordsIdsMultiSelectState,
  );

  const { relationPickerSearchFilterState } = useRelationPickerScopedStates({
    relationPickerScopedId,
  });

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
          {recordMultiSelectIsLoading ? (
            <MenuItem text="Loading..." />
          ) : (
            <>
              <SelectableList
                selectableListId={MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID}
                selectableItemIdArray={objectRecordsIdsMultiSelect}
                hotkeyScope={RelationPickerHotkeyScope.RelationPicker}
              >
                {objectRecordsIdsMultiSelect?.map((recordId) => {
                  return (
                    <MultipleObjectRecordSelectItem
                      key={recordId}
                      objectRecordId={recordId}
                      onChange={onChange}
                    />
                  );
                })}
              </SelectableList>
              {objectRecordsIdsMultiSelect?.length === 0 && (
                <MenuItem text="No result" />
              )}
            </>
          )}
        </DropdownMenuItemsContainer>
      </DropdownMenu>
    </>
  );
};
