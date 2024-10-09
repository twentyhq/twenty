import { useObjectRecordMultiSelectScopedStates } from '@/activities/hooks/useObjectRecordMultiSelectScopedStates';
import { MultipleObjectRecordOnClickOutsideEffect } from '@/object-record/relation-picker/components/MultipleObjectRecordOnClickOutsideEffect';
import { MultipleObjectRecordSelectItem } from '@/object-record/relation-picker/components/MultipleObjectRecordSelectItem';
import { MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID } from '@/object-record/relation-picker/constants/MultiObjectRecordSelectSelectableListId';
import { useRelationPickerScopedStates } from '@/object-record/relation-picker/hooks/internal/useRelationPickerScopedStates';
import { RelationPickerScopeInternalContext } from '@/object-record/relation-picker/scopes/scope-internal-context/RelationPickerScopeInternalContext';
import { CreateNewButton } from '@/ui/input/relation-picker/components/CreateNewButton';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import styled from '@emotion/styled';
import { useCallback, useEffect, useRef } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { IconPlus, isDefined } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
`;

export const MultiRecordSelect = ({
  onChange,
  onSubmit,
  onCreate,
}: {
  onChange?: (changedRecordForSelectId: string) => void;
  onSubmit?: () => void;
  onCreate?: ((searchInput?: string) => void) | (() => void);
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const setHotkeyScope = useSetHotkeyScope();
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

  const relationPickerScopedId = useAvailableScopeIdOrThrow(
    RelationPickerScopeInternalContext,
  );

  const { objectRecordsIdsMultiSelectState, recordMultiSelectIsLoadingState } =
    useObjectRecordMultiSelectScopedStates(relationPickerScopedId);

  const { resetSelectedItem } = useSelectableList(
    MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID,
  );
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

  useEffect(() => {
    setHotkeyScope(relationPickerScopedId);
  }, [setHotkeyScope, relationPickerScopedId]);

  useScopedHotkeys(
    Key.Escape,
    () => {
      onSubmit?.();
      goBackToPreviousHotkeyScope();
      resetSelectedItem();
    },
    relationPickerScopedId,
    [onSubmit, goBackToPreviousHotkeyScope, resetSelectedItem],
  );

  const debouncedOnCreate = useDebouncedCallback(
    () => onCreate?.(relationPickerSearchFilter),
    500,
  );

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
                hotkeyScope={relationPickerScopedId}
                onEnter={(selectedId) => {
                  onChange?.(selectedId);
                  resetSelectedItem();
                }}
              >
                {objectRecordsIdsMultiSelect?.map((recordId) => {
                  return (
                    <MultipleObjectRecordSelectItem
                      key={recordId}
                      objectRecordId={recordId}
                      onChange={(recordId) => {
                        onChange?.(recordId);
                        resetSelectedItem();
                      }}
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
        {isDefined(onCreate) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItemsContainer>
              <CreateNewButton
                onClick={debouncedOnCreate}
                LeftIcon={IconPlus}
                text="Add New"
              />
            </DropdownMenuItemsContainer>
          </>
        )}
      </DropdownMenu>
    </>
  );
};
