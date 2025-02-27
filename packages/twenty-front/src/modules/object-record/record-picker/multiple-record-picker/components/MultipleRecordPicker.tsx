import { MultipleRecordPickerMenuItem } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerMenuItem';
import { MultipleRecordPickerOnClickOutsideEffect } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerOnClickOutsideEffect';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerIsLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsLoadingComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSelectedRecordsIdsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSelectedRecordsIdsComponentState';
import { MultipleRecordPickerHotkeyScope } from '@/object-record/record-picker/multiple-record-picker/types/MultipleRecordPickerHotkeyScope';
import { getMultipleRecordPickerSelectableListId } from '@/object-record/record-picker/multiple-record-picker/utils/getMultipleRecordPickerSelectableListId';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
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
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import { Placement } from '@floating-ui/react';
import { useCallback, useRef } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared';
import { IconPlus } from 'twenty-ui';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
`;

type MultipleRecordPickerProps = {
  onChange?: (changedRecordForSelectId: string) => void;
  onSubmit?: () => void;
  onCreate?: ((searchInput?: string) => void) | (() => void);
  dropdownPlacement?: Placement | null;
  componentInstanceId: string;
  onClickOutside: () => void;
};

export const MultipleRecordPicker = ({
  onChange,
  onSubmit,
  onCreate,
  onClickOutside,
  dropdownPlacement,
  componentInstanceId,
}: MultipleRecordPickerProps) => {
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

  const selectableListComponentInstanceId =
    getMultipleRecordPickerSelectableListId(componentInstanceId);

  const { resetSelectedItem } = useSelectableList(
    selectableListComponentInstanceId,
  );

  const recordMultiSelectIsLoading = useRecoilComponentValueV2(
    multipleRecordPickerIsLoadingComponentState,
    componentInstanceId,
  );

  const objectRecordsIdsMultiSelect = useRecoilComponentValueV2(
    multipleRecordPickerSelectedRecordsIdsComponentState,
    componentInstanceId,
  );

  const [recordPickerSearchFilter, setRecordPickerSearchFilter] =
    useRecoilComponentStateV2(
      multipleRecordPickerSearchFilterComponentState,
      componentInstanceId,
    );

  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  const handleSubmit = () => {
    onSubmit?.();
    goBackToPreviousHotkeyScope();
    resetSelectedItem();
  };

  useScopedHotkeys(
    Key.Escape,
    () => {
      handleSubmit();
    },
    MultipleRecordPickerHotkeyScope.MultipleRecordPicker,
    [handleSubmit],
  );

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRecordPickerSearchFilter(event.currentTarget.value);
    },
    [setRecordPickerSearchFilter],
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // TODO: refactor this in a separate component
  const results = (
    <DropdownMenuItemsContainer hasMaxHeight>
      <SelectableList
        selectableListId={selectableListComponentInstanceId}
        selectableItemIdArray={objectRecordsIdsMultiSelect}
        hotkeyScope={MultipleRecordPickerHotkeyScope.MultipleRecordPicker}
        onEnter={(selectedId) => {
          onChange?.(selectedId);
          resetSelectedItem();
        }}
      >
        {objectRecordsIdsMultiSelect?.map((recordId) => {
          return (
            <MultipleRecordPickerMenuItem
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
    <MultipleRecordPickerComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      <MultipleRecordPickerOnClickOutsideEffect
        containerRef={containerRef}
        onClickOutside={onClickOutside}
      />
      <DropdownMenu ref={containerRef} data-select-disable width={200}>
        {dropdownPlacement?.includes('end') && (
          <>
            {isDefined(onCreate) && !hasObjectReadOnlyPermission && (
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
    </MultipleRecordPickerComponentInstanceContext.Provider>
  );
};
