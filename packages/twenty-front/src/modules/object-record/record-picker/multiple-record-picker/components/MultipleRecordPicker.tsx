import {
  Dropdown,
  useDropdownPage,
  useDropdownPlacementOrThrow,
} from 'twenty-ui/components/navigation';
import { useRef } from 'react';
import { useStore } from 'jotai';

import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { MultipleRecordPickerCreateTargetSelect } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerCreateTargetSelect';
import { MultipleRecordPickerItemsDisplay } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerItemsDisplay';
import { MultipleRecordPickerSearchInput } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerSearchInput';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerIsLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsLoadingComponentState';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { upsertMorphItem } from '@/object-record/record-picker/multiple-record-picker/utils/upsertMorphItem';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type RecordPickerLayoutDirection } from '@/object-record/record-picker/types/RecordPickerLayoutDirection';
import { getMultipleRecordPickerLayoutDirection } from '@/object-record/record-picker/multiple-record-picker/utils/getMultipleRecordPickerLayoutDirection';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/icon';
import { logError } from '~/utils/logError';

type MultipleRecordPickerProps = {
  onChange?: (morphItem: RecordPickerPickableMorphItem) => void;
  onCreate?: (options: {
    searchInput?: string;
    objectMetadataItemId: string;
  }) => Promise<RecordPickerPickableMorphItem | undefined>;
  isCreatePending?: boolean;
  layoutDirection?: RecordPickerLayoutDirection;
  componentInstanceId: string;
};

export const MultipleRecordPicker = ({
  onChange,
  onCreate,
  layoutDirection,
  componentInstanceId,
  isCreatePending = false,
}: MultipleRecordPickerProps) => {
  const { page, goBack } = useDropdownPage();
  const { side, align } = useDropdownPlacementOrThrow();
  const resolvedLayoutDirection = getMultipleRecordPickerLayoutDirection({
    layoutDirection,
    side,
    align,
  });
  // oxlint-disable-next-line twenty/no-state-useref
  const createInFlightRef = useRef(false);

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
      if (page === 'create-target') {
        goBack();
      }

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
  };

  const createNewButtonSection = isNonEmptyArray(
    creatableObjectMetadataItems,
  ) ? (
    <Dropdown.Section>
      <Dropdown.ActionItem
        onClick={handleCreateNewButtonClick}
        closeOnClick={false}
        disabled={isCreatePending}
        startIcon={<IconPlus />}
        page={
          creatableObjectMetadataItems.length > 1 ? 'create-target' : undefined
        }
      >{t`Add New`}</Dropdown.ActionItem>
    </Dropdown.Section>
  ) : null;

  return (
    <MultipleRecordPickerComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      <Dropdown.Page id="create-target">
        <MultipleRecordPickerCreateTargetSelect
          objectMetadataItems={creatableObjectMetadataItems}
          disabled={isCreatePending}
          onSelect={(objectMetadataItemId) => {
            void handleCreate(objectMetadataItemId);
          }}
        />
      </Dropdown.Page>
      <Dropdown.Page id="records">
        {resolvedLayoutDirection === 'search-bar-on-bottom' && (
          <>
            {createNewButtonSection}
            <MultipleRecordPickerItemsDisplay onChange={onChange} />
          </>
        )}
        <MultipleRecordPickerSearchInput />
        {resolvedLayoutDirection === 'search-bar-on-top' && (
          <>
            <MultipleRecordPickerItemsDisplay onChange={onChange} />
            {createNewButtonSection}
          </>
        )}
      </Dropdown.Page>
    </MultipleRecordPickerComponentInstanceContext.Provider>
  );
};
