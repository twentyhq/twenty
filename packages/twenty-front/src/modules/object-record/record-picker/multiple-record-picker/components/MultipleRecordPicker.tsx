import { useCallback, useRef, useState } from 'react';
import { useStore } from 'jotai';

import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { MultipleRecordPickerCreateTargetSelect } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerCreateTargetSelect';
import { MultipleRecordPickerItemsDisplay } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerItemsDisplay';
import { MultipleRecordPickerOnClickOutsideEffect } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerOnClickOutsideEffect';
import { MultipleRecordPickerSearchInput } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerSearchInput';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerIsLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsLoadingComponentState';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { getMultipleRecordPickerSelectableListId } from '@/object-record/record-picker/multiple-record-picker/utils/getMultipleRecordPickerSelectableListId';
import { upsertMorphItem } from '@/object-record/record-picker/multiple-record-picker/utils/upsertMorphItem';
import { type RecordPickerLayoutDirection } from '@/object-record/record-picker/types/RecordPickerLayoutDirection';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { CreateNewButton } from '@/ui/input/relation-picker/components/CreateNewButton';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/icon';
import { logError } from '~/utils/logError';

type MultipleRecordPickerProps = {
  onChange?: (morphItem: RecordPickerPickableMorphItem) => void;
  onSubmit?: () => void;
  onCreate?: (options: {
    searchInput?: string;
    objectMetadataItemId: string;
  }) => Promise<RecordPickerPickableMorphItem | undefined>;
  isCreatePending?: boolean;
  layoutDirection?: RecordPickerLayoutDirection;
  componentInstanceId: string;
  onClickOutside: () => void;
  focusId: string;
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
  dropdownWidth,
  isCreatePending = false,
}: MultipleRecordPickerProps) => {
  const [isSelectingCreateTarget, setIsSelectingCreateTarget] = useState(false);
  // oxlint-disable-next-line twenty/no-state-useref
  const createInFlightRef = useRef(false);
  const selectableListComponentInstanceId =
    getMultipleRecordPickerSelectableListId(componentInstanceId);

  const { resetSelectedItem } = useSelectableList(
    selectableListComponentInstanceId,
  );

  const multipleRecordPickerSearchFilterState =
    useAtomComponentStateCallbackState(
      multipleRecordPickerSearchFilterComponentState,
      componentInstanceId,
    );

  const multipleRecordPickerPickableMorphItemsState =
    useAtomComponentStateCallbackState(
      multipleRecordPickerPickableMorphItemsComponentState,
      componentInstanceId,
    );

  const multipleRecordPickerSearchableObjectMetadataItems =
    useAtomComponentStateValue(
      multipleRecordPickerSearchableObjectMetadataItemsComponentState,
      componentInstanceId,
    );

  const multipleRecordPickerIsLoadingState = useAtomComponentStateCallbackState(
    multipleRecordPickerIsLoadingComponentState,
    componentInstanceId,
  );

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { performSearch } = useMultipleRecordPickerPerformSearch();

  const store = useStore();

  const resetState = useCallback(() => {
    store.set(multipleRecordPickerPickableMorphItemsState, []);
    store.set(multipleRecordPickerSearchFilterState, '');
    setIsSelectingCreateTarget(false);
  }, [
    multipleRecordPickerPickableMorphItemsState,
    multipleRecordPickerSearchFilterState,
    store,
  ]);

  const handleSubmit = useCallback(() => {
    onSubmit?.();
    resetSelectedItem();
    resetState();
  }, [onSubmit, resetSelectedItem, resetState]);

  const handleClickOutside = useCallback(() => {
    onClickOutside();
    resetSelectedItem();
    resetState();
  }, [onClickOutside, resetSelectedItem, resetState]);

  const handleBackToRecordSelect = useCallback(() => {
    resetSelectedItem();
    setIsSelectingCreateTarget(false);
  }, [resetSelectedItem]);

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      if (isSelectingCreateTarget) {
        handleBackToRecordSelect();
      } else {
        handleSubmit();
      }
    },
    focusId,
    dependencies: [
      handleBackToRecordSelect,
      handleSubmit,
      isSelectingCreateTarget,
    ],
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const creatableObjectMetadataItems = isDefined(onCreate)
    ? multipleRecordPickerSearchableObjectMetadataItems.filter(
        (objectMetadataItem) =>
          canCreateRecordsForObjectMetadataItem({
            objectPermissions: getObjectPermissionsForObject(
              objectPermissionsByObjectMetadataId,
              objectMetadataItem.id,
            ),
            objectMetadataItem,
          }),
      )
    : [];

  const handleCreate = async (objectMetadataItemId: string) => {
    if (isCreatePending || createInFlightRef.current || !isDefined(onCreate)) {
      return;
    }

    createInFlightRef.current = true;
    const searchInput = store.get(multipleRecordPickerSearchFilterState);

    try {
      const createdMorphItem = await onCreate({
        searchInput,
        objectMetadataItemId,
      });

      if (!isDefined(createdMorphItem)) {
        return;
      }

      const currentMorphItems = store.get(
        multipleRecordPickerPickableMorphItemsState,
      );
      const newMorphItems = upsertMorphItem(
        currentMorphItems,
        createdMorphItem,
      );

      store.set(multipleRecordPickerPickableMorphItemsState, newMorphItems);
      resetSelectedItem();
      setIsSelectingCreateTarget(false);

      await performSearch({
        multipleRecordPickerInstanceId: componentInstanceId,
        forceSearchFilter: searchInput,
        forceSearchableObjectMetadataItems:
          multipleRecordPickerSearchableObjectMetadataItems,
        forcePickableMorphItems: newMorphItems,
      });

      store.set(
        multipleRecordPickerPickableMorphItemsState,
        upsertMorphItem(
          store.get(multipleRecordPickerPickableMorphItemsState),
          createdMorphItem,
        ),
      );
    } catch (error) {
      store.set(multipleRecordPickerIsLoadingState, false);
      logError(error);
    } finally {
      createInFlightRef.current = false;
    }
  };

  const handleCreateNewButtonClick = () => {
    if (isCreatePending) {
      return;
    }

    if (creatableObjectMetadataItems.length === 1) {
      void handleCreate(creatableObjectMetadataItems[0].id);
      return;
    }

    resetSelectedItem();
    setIsSelectingCreateTarget(true);
  };

  const createNewButtonSection =
    creatableObjectMetadataItems.length > 0 ? (
      <DropdownMenuItemsContainer scrollable={false}>
        <CreateNewButton
          onClick={handleCreateNewButtonClick}
          disabled={isCreatePending}
          LeftIcon={IconPlus}
          text={t`Add New`}
          hasSubMenu={creatableObjectMetadataItems.length > 1}
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
        {isSelectingCreateTarget ? (
          <MultipleRecordPickerCreateTargetSelect
            objectMetadataItems={creatableObjectMetadataItems}
            selectableListInstanceId={selectableListComponentInstanceId}
            focusId={focusId}
            disabled={isCreatePending}
            onBack={handleBackToRecordSelect}
            onSelect={(objectMetadataItemId) => {
              void handleCreate(objectMetadataItemId);
            }}
          />
        ) : (
          <>
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
          </>
        )}
      </DropdownContent>
    </MultipleRecordPickerComponentInstanceContext.Provider>
  );
};
