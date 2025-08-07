import { MultipleRecordPickerItemsDisplay } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerItemsDisplay';
import { MultipleRecordPickerOnClickOutsideEffect } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerOnClickOutsideEffect';
import { MultipleRecordPickerSearchInput } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerSearchInput';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { getMultipleRecordPickerSelectableListId } from '@/object-record/record-picker/multiple-record-picker/utils/getMultipleRecordPickerSelectableListId';
import { RecordPickerLayoutDirection } from '@/object-record/record-picker/types/RecordPickerLayoutDirection';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { CreateNewButton } from '@/ui/input/relation-picker/components/CreateNewButton';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRef } from 'react';
import { useRecoilCallback } from 'recoil';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';

type MultipleRecordPickerProps = {
  onChange?: (morphItem: RecordPickerPickableMorphItem) => void;
  onSubmit?: () => void;
  onCreate?: ((searchInput?: string) => void) | (() => void);
  layoutDirection?: RecordPickerLayoutDirection;
  componentInstanceId: string;
  onClickOutside: () => void;
  focusId: string;
};

export const MultipleRecordPicker = ({
  onChange,
  onSubmit,
  onCreate,
  onClickOutside,
  layoutDirection = 'search-bar-on-bottom',
  componentInstanceId,
  focusId,
}: MultipleRecordPickerProps) => {
  const selectableListComponentInstanceId =
    getMultipleRecordPickerSelectableListId(componentInstanceId);

  const { resetSelectedItem } = useSelectableList(
    selectableListComponentInstanceId,
  );

  const multipleRecordPickerSearchFilterState = useRecoilComponentCallbackState(
    multipleRecordPickerSearchFilterComponentState,
    componentInstanceId,
  );

  const multipleRecordPickerPickableMorphItemsState =
    useRecoilComponentCallbackState(
      multipleRecordPickerPickableMorphItemsComponentState,
      componentInstanceId,
    );

  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  const resetState = useRecoilCallback(
    ({ set }) => {
      return () => {
        set(multipleRecordPickerPickableMorphItemsState, []);
        set(multipleRecordPickerSearchFilterState, '');
      };
    },
    [
      multipleRecordPickerPickableMorphItemsState,
      multipleRecordPickerSearchFilterState,
    ],
  );

  const handleSubmit = () => {
    onSubmit?.();
    resetSelectedItem();
    resetState();
  };

  const handleClickOutside = () => {
    onClickOutside();
    resetState();
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      handleSubmit();
    },
    focusId,
    dependencies: [handleSubmit],
  });

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

  const createNewButtonSection =
    isDefined(onCreate) && !hasObjectReadOnlyPermission ? (
      <DropdownMenuItemsContainer scrollable={false}>
        <CreateNewButton
          onClick={handleCreateNewButtonClick}
          LeftIcon={IconPlus}
          text="Add New"
        />
      </DropdownMenuItemsContainer>
    ) : null;

  return (
    <MultipleRecordPickerComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      <MultipleRecordPickerOnClickOutsideEffect
        containerRef={containerRef}
        onClickOutside={handleClickOutside}
      />
      <DropdownContent ref={containerRef}>
        {layoutDirection === 'search-bar-on-bottom' && (
          <>
            {createNewButtonSection}
            <MultipleRecordPickerItemsDisplay
              onChange={onChange}
              focusId={focusId}
            />
          </>
        )}
        <MultipleRecordPickerSearchInput />
        {layoutDirection === 'search-bar-on-top' && (
          <>
            <MultipleRecordPickerItemsDisplay
              onChange={onChange}
              focusId={focusId}
            />
            {createNewButtonSection}
          </>
        )}
      </DropdownContent>
    </MultipleRecordPickerComponentInstanceContext.Provider>
  );
};
