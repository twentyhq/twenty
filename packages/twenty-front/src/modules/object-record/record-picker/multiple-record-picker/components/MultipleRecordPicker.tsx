import { MultipleRecordPickerMenuItems } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerMenuItems';
import { MultipleRecordPickerOnClickOutsideEffect } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerOnClickOutsideEffect';
import { MultipleRecordPickerSearchInput } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerSearchInput';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerIsLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsLoadingComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerPickableMorphItemsLengthComponentSelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerPickableMorphItemsLengthComponentSelector';
import { MultipleRecordPickerHotkeyScope } from '@/object-record/record-picker/multiple-record-picker/types/MultipleRecordPickerHotkeyScope';
import { getMultipleRecordPickerSelectableListId } from '@/object-record/record-picker/multiple-record-picker/utils/getMultipleRecordPickerSelectableListId';
import { RecordPickerLayoutDirection } from '@/object-record/record-picker/types/RecordPickerLayoutDirection';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { CreateNewButton } from '@/ui/input/relation-picker/components/CreateNewButton';
import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import { useRef } from 'react';
import { useRecoilCallback } from 'recoil';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared';
import { IconPlus } from 'twenty-ui';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
`;

type MultipleRecordPickerProps = {
  onChange?: (morphItem: RecordPickerPickableMorphItem) => void;
  onSubmit?: () => void;
  onCreate?: ((searchInput?: string) => void) | (() => void);
  layoutDirection?: RecordPickerLayoutDirection;
  componentInstanceId: string;
  onClickOutside: () => void;
};

export const MultipleRecordPicker = ({
  onChange,
  onSubmit,
  onCreate,
  onClickOutside,
  layoutDirection = 'search-bar-on-bottom',
  componentInstanceId,
}: MultipleRecordPickerProps) => {
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

  const selectableListComponentInstanceId =
    getMultipleRecordPickerSelectableListId(componentInstanceId);

  const { resetSelectedItem } = useSelectableList(
    selectableListComponentInstanceId,
  );

  const multipleRecordPickerIsLoading = useRecoilComponentValueV2(
    multipleRecordPickerIsLoadingComponentState,
    componentInstanceId,
  );

  const itemsLength = useRecoilComponentValueV2(
    multipleRecordPickerPickableMorphItemsLengthComponentSelector,
    componentInstanceId,
  );

  const multipleRecordPickerSearchFilterState =
    useRecoilComponentCallbackStateV2(
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

  const containerRef = useRef<HTMLDivElement>(null);

  const handleCreateNewButtonClick = useRecoilCallback(
    ({ snapshot }) => {
      return () => {
        const recordPickerSearchFilter = snapshot
          .getLoadable(multipleRecordPickerSearchFilterState)
          .getValue();
        onCreate?.(recordPickerSearchFilter);
      };
    },
    [multipleRecordPickerSearchFilterState, onCreate],
  );

  const createNewButton = isDefined(onCreate) && (
    <CreateNewButton
      onClick={handleCreateNewButtonClick}
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
        {layoutDirection === 'search-bar-on-bottom' && (
          <>
            {isDefined(onCreate) && !hasObjectReadOnlyPermission && (
              <DropdownMenuItemsContainer scrollable={false}>
                {createNewButton}
              </DropdownMenuItemsContainer>
            )}
            <DropdownMenuSeparator />
            {itemsLength > 0 && (
              <MultipleRecordPickerMenuItems onChange={onChange} />
            )}
            {multipleRecordPickerIsLoading && (
              <>
                <DropdownMenuSkeletonItem />
                <DropdownMenuSeparator />
              </>
            )}
            {itemsLength > 0 && <DropdownMenuSeparator />}
          </>
        )}
        <MultipleRecordPickerSearchInput />
        {layoutDirection === 'search-bar-on-top' && (
          <>
            <DropdownMenuSeparator />
            {multipleRecordPickerIsLoading && (
              <>
                <DropdownMenuSkeletonItem />
                <DropdownMenuSeparator />
              </>
            )}
            {itemsLength > 0 && (
              <MultipleRecordPickerMenuItems onChange={onChange} />
            )}
            {itemsLength > 0 && <DropdownMenuSeparator />}
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
