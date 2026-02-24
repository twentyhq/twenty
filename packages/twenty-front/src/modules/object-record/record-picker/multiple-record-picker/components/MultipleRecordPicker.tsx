import { useCallback, useRef } from 'react';
import { useStore } from 'jotai';

import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { MultipleRecordPickerItemsDisplay } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerItemsDisplay';
import { MultipleRecordPickerOnClickOutsideEffect } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerOnClickOutsideEffect';
import { MultipleRecordPickerSearchInput } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerSearchInput';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { getMultipleRecordPickerSelectableListId } from '@/object-record/record-picker/multiple-record-picker/utils/getMultipleRecordPickerSelectableListId';
import { type RecordPickerLayoutDirection } from '@/object-record/record-picker/types/RecordPickerLayoutDirection';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { CreateNewButton } from '@/ui/input/relation-picker/components/CreateNewButton';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/display';

type MultipleRecordPickerProps = {
  onChange?: (morphItem: RecordPickerPickableMorphItem) => void;
  onSubmit?: () => void;
  onCreate?: ((searchInput?: string) => void) | (() => void);
  layoutDirection?: RecordPickerLayoutDirection;
  componentInstanceId: string;
  onClickOutside: () => void;
  focusId: string;
  objectMetadataItemIdForCreate?: string;
  dropdownWidth?: number;
};

export const MultipleRecordPicker = ({
  onChange,
  onSubmit,
  onCreate,
  onClickOutside,
  layoutDirection = 'search-bar-on-bottom',
  componentInstanceId,
  focusId,
  objectMetadataItemIdForCreate,
  dropdownWidth,
}: MultipleRecordPickerProps) => {
  const selectableListComponentInstanceId =
    getMultipleRecordPickerSelectableListId(componentInstanceId);

  const { resetSelectedItem } = useSelectableList(
    selectableListComponentInstanceId,
  );

  const multipleRecordPickerSearchFilterState =
    useRecoilComponentStateCallbackStateV2(
      multipleRecordPickerSearchFilterComponentState,
      componentInstanceId,
    );

  const multipleRecordPickerPickableMorphItemsState =
    useRecoilComponentStateCallbackStateV2(
      multipleRecordPickerPickableMorphItemsComponentState,
      componentInstanceId,
    );

  const store = useStore();

  const resetState = useCallback(() => {
    store.set(multipleRecordPickerPickableMorphItemsState, []);
    store.set(multipleRecordPickerSearchFilterState, '');
  }, [
    multipleRecordPickerPickableMorphItemsState,
    multipleRecordPickerSearchFilterState,
    store,
  ]);

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

  const handleCreateNewButtonClick = useCallback(() => {
    const recordPickerSearchFilter = store.get(
      multipleRecordPickerSearchFilterState,
    );
    onCreate?.(recordPickerSearchFilter);
  }, [multipleRecordPickerSearchFilterState, onCreate, store]);

  const hasCreatePermissionOnObjectForCreate = useObjectPermissionsForObject(
    objectMetadataItemIdForCreate ?? '',
  ).canUpdateObjectRecords;

  const createNewButtonSection =
    isDefined(onCreate) && hasCreatePermissionOnObjectForCreate ? (
      <DropdownMenuItemsContainer scrollable={false}>
        <CreateNewButton
          onClick={handleCreateNewButtonClick}
          LeftIcon={IconPlus}
          text={t`Add New`}
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
      <DropdownContent ref={containerRef} widthInPixels={dropdownWidth}>
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
