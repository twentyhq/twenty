import { useObjectRecordMultiSelectScopedStates } from '@/activities/hooks/useObjectRecordMultiSelectScopedStates';
import { MultipleRecordPickerMenuItem } from '@/object-record/record-picker/components/MultipleRecordPickerMenuItem';
import { RECORD_PICKER_SELECTABLE_LIST_COMPONENT_INSTANCE_ID } from '@/object-record/record-picker/constants/RecordPickerSelectableListComponentInstanceId';
import { RecordPickerComponentInstanceContext } from '@/object-record/record-picker/states/contexts/RecordPickerComponentInstanceContext';
import { recordPickerSearchFilterComponentState } from '@/object-record/record-picker/states/recordPickerSearchFilterComponentState';
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
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import styled from '@emotion/styled';
import { Placement } from '@floating-ui/react';
import { useCallback, useRef } from 'react';
import { useRecoilValue } from 'recoil';
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
};

export const MultipleRecordPicker = ({
  onChange,
  onSubmit,
  onCreate,
  dropdownPlacement,
  componentInstanceId,
}: MultipleRecordPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordPickerComponentInstanceContext,
    componentInstanceId,
  );

  const { objectRecordsIdsMultiSelectState, recordMultiSelectIsLoadingState } =
    useObjectRecordMultiSelectScopedStates(instanceId);

  const { resetSelectedItem } = useSelectableList(
    RECORD_PICKER_SELECTABLE_LIST_COMPONENT_INSTANCE_ID,
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
    instanceId,
    [handleSubmit],
  );

  useListenClickOutside({
    refs: [containerRef],
    callback: handleSubmit,
    listenerId: 'MULTI_RECORD_SELECT_LISTENER_ID',
    hotkeyScope: instanceId,
  });

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
        selectableListId={RECORD_PICKER_SELECTABLE_LIST_COMPONENT_INSTANCE_ID}
        selectableItemIdArray={objectRecordsIdsMultiSelect}
        hotkeyScope={instanceId}
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
    <RecordPickerComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
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
    </RecordPickerComponentInstanceContext.Provider>
  );
};
