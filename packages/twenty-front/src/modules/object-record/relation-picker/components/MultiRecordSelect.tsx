import { useObjectRecordMultiSelectScopedStates } from '@/activities/hooks/useObjectRecordMultiSelectScopedStates';
import { MultipleObjectRecordOnClickOutsideEffect } from '@/object-record/relation-picker/components/MultipleObjectRecordOnClickOutsideEffect';
import { MultipleObjectRecordSelectItem } from '@/object-record/relation-picker/components/MultipleObjectRecordSelectItem';
import { MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID } from '@/object-record/relation-picker/constants/MultiObjectRecordSelectSelectableListId';
import { useRelationPickerScopedStates } from '@/object-record/relation-picker/hooks/internal/useRelationPickerScopedStates';
import { RelationPickerScopeInternalContext } from '@/object-record/relation-picker/scopes/scope-internal-context/RelationPickerScopeInternalContext';
import { CreateNewButton } from '@/ui/input/relation-picker/components/CreateNewButton';
import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import styled from '@emotion/styled';
import { Placement } from '@floating-ui/react';
import { useCallback, useEffect, useRef } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { IconPlus, isDefined } from 'twenty-ui';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
`;

export const MultiRecordSelect = ({
  onChange,
  onSubmit,
  onCreate,
  dropdownPlacement,
}: {
  onChange?: (changedRecordForSelectId: string) => void;
  onSubmit?: () => void;
  onCreate?: ((searchInput?: string) => void) | (() => void);
  dropdownPlacement?: Placement | null;
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

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchFilter(event.currentTarget.value);
    },
    [setSearchFilter],
  );

  const results = (
    <DropdownMenuItemsContainer hasMaxHeight>
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
    </DropdownMenuItemsContainer>
  );

  const createNewButton = isDefined(onCreate) && (
    <CreateNewButton
      onClick={() => onCreate?.(relationPickerSearchFilter)}
      LeftIcon={IconPlus}
      text="Add New"
    />
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
        {dropdownPlacement?.includes('end') && (
          <>
            {isDefined(onCreate) && (
              <DropdownMenuItemsContainer>
                {createNewButton}
              </DropdownMenuItemsContainer>
            )}
            <DropdownMenuSeparator />
            {objectRecordsIdsMultiSelect?.length > 0 && results}
            {recordMultiSelectIsLoading && !relationPickerSearchFilter && (
              <>
                <DropdownMenuSkeletonItem />
                <DropdownMenuSeparator />
              </>
            )}
            {objectRecordsIdsMultiSelect?.length > 0 && (
              <DropdownMenuSeparator />
            )}
          </>
        )}
        <DropdownMenuSearchInput
          value={relationPickerSearchFilter}
          onChange={handleFilterChange}
          autoFocus
        />
        {(dropdownPlacement?.includes('start') ||
          isUndefinedOrNull(dropdownPlacement)) && (
          <>
            <DropdownMenuSeparator />
            {recordMultiSelectIsLoading && !relationPickerSearchFilter && (
              <>
                <DropdownMenuSkeletonItem />
                <DropdownMenuSeparator />
              </>
            )}
            {objectRecordsIdsMultiSelect?.length > 0 && results}
            {objectRecordsIdsMultiSelect?.length > 0 && (
              <DropdownMenuSeparator />
            )}
            {isDefined(onCreate) && <div>{createNewButton}</div>}
          </>
        )}
      </DropdownMenu>
    </>
  );
};
