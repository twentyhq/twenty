import { useObjectRecordMultiSelectScopedStates } from '@/activities/hooks/useObjectRecordMultiSelectScopedStates';
import { MultipleObjectRecordOnClickOutsideEffect } from '@/object-record/relation-picker/components/MultipleObjectRecordOnClickOutsideEffect';
import { MultipleObjectRecordSelectItem } from '@/object-record/relation-picker/components/MultipleObjectRecordSelectItem';
import { MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID } from '@/object-record/relation-picker/constants/MultiObjectRecordSelectSelectableListId';
import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { recordPickerSearchFilterComponentState } from '@/object-record/relation-picker/states/recordPickerSearchFilterComponentState';
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
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import styled from '@emotion/styled';
import { Placement } from '@floating-ui/react';
import { useCallback, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
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

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordPickerComponentInstanceContext,
  );

  const { objectRecordsIdsMultiSelectState, recordMultiSelectIsLoadingState } =
    useObjectRecordMultiSelectScopedStates(instanceId);

  const { resetSelectedItem } = useSelectableList(
    MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID,
  );
  const recordMultiSelectIsLoading = useRecoilValue(
    recordMultiSelectIsLoadingState,
  );

  const objectRecordsIdsMultiSelect = useRecoilValue(
    objectRecordsIdsMultiSelectState,
  );

  const setSearchFilter = useSetRecoilComponentStateV2(
    recordPickerSearchFilterComponentState,
    instanceId,
  );
  const recordPickerSearchFilter = useRecoilComponentValueV2(
    recordPickerSearchFilterComponentState,
    instanceId,
  );

  useEffect(() => {
    setHotkeyScope(instanceId);
  }, [setHotkeyScope, instanceId]);

  useScopedHotkeys(
    Key.Escape,
    () => {
      onSubmit?.();
      goBackToPreviousHotkeyScope();
      resetSelectedItem();
    },
    instanceId,
    [onSubmit, goBackToPreviousHotkeyScope, resetSelectedItem],
  );

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchFilter(event.currentTarget.value);
    },
    [setSearchFilter],
  );

  // TODO: refactor this in a separate component
  const results = (
    <DropdownMenuItemsContainer hasMaxHeight>
      <SelectableList
        selectableListId={MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID}
        selectableItemIdArray={objectRecordsIdsMultiSelect}
        hotkeyScope={instanceId}
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
      onClick={() => onCreate?.(recordPickerSearchFilter)}
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
      <DropdownMenu ref={containerRef} data-select-disable width={200}>
        {dropdownPlacement?.includes('end') && (
          <>
            {isDefined(onCreate) && (
              <DropdownMenuItemsContainer scrollable={false}>
                {createNewButton}
              </DropdownMenuItemsContainer>
            )}
            <DropdownMenuSeparator />
            {objectRecordsIdsMultiSelect?.length > 0 && results}
            {recordMultiSelectIsLoading && !recordPickerSearchFilter && (
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
          value={recordPickerSearchFilter}
          onChange={handleFilterChange}
          autoFocus
        />
        {(dropdownPlacement?.includes('start') ||
          isUndefinedOrNull(dropdownPlacement)) && (
          <>
            <DropdownMenuSeparator />
            {recordMultiSelectIsLoading && !recordPickerSearchFilter && (
              <>
                <DropdownMenuSkeletonItem />
                <DropdownMenuSeparator />
              </>
            )}
            {objectRecordsIdsMultiSelect?.length > 0 && results}
            {objectRecordsIdsMultiSelect?.length > 0 && (
              <DropdownMenuSeparator />
            )}
            {isDefined(onCreate) && (
              <DropdownMenuItemsContainer scrollable={false}>
                {createNewButton}
              </DropdownMenuItemsContainer>
            )}
          </>
        )}
      </DropdownMenu>
    </>
  );
};
