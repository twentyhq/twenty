import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldRelationFromManyValue,
  type FieldRelationMetadata,
  type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { extractTargetRecordsFromJunction } from '@/object-record/record-field/ui/utils/junction/extractTargetRecordsFromJunction';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getSearchableObjectMetadataItems } from '@/object-record/record-field/ui/utils/junction/getSearchableObjectMetadataItems';
import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useOpenJunctionRelationFieldInput = () => {
  const { performSearch } = useMultipleRecordPickerPerformSearch();
  const { openMultipleRecordPicker } = useMultipleRecordPickerOpen();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const store = useStore();

  const openJunctionRelationFieldInput = useCallback(
    ({
      fieldDefinition,
      recordId,
      prefix,
      recordPickerInstanceId,
    }: {
      fieldDefinition: FieldDefinition<FieldRelationMetadata>;
      recordId: string;
      prefix?: string;
      recordPickerInstanceId?: string;
    }) => {
      const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

      const sourceObjectMetadataId = objectMetadataItems.find(
        (item) =>
          item.nameSingular ===
          fieldDefinition.metadata.objectMetadataNameSingular,
      )?.id;

      const junctionConfig = getJunctionConfig({
        settings: fieldDefinition.metadata.settings,
        relationObjectMetadataId:
          fieldDefinition.metadata.relationObjectMetadataId,
        relationTargetFieldMetadataId:
          fieldDefinition.metadata.relationFieldMetadataId,
        sourceObjectMetadataId,
        objectMetadataItems,
      });

      if (!isDefined(junctionConfig)) {
        return;
      }

      const { targetFields } = junctionConfig;

      if (targetFields.length === 0) {
        return;
      }

      const resolvedRecordPickerInstanceId =
        recordPickerInstanceId ??
        getRecordFieldInputInstanceId({
          recordId,
          fieldName: fieldDefinition.metadata.fieldName,
          prefix,
        });

      const junctionRecords = store.get(
        recordStoreFamilySelector.selectorFamily({
          recordId,
          fieldName: fieldDefinition.metadata.fieldName,
        }),
      ) as FieldRelationValue<FieldRelationFromManyValue>;

      const selectedTargetRecords = extractTargetRecordsFromJunction({
        junctionRecords,
        targetFields,
        objectMetadataItems,
      });

      const searchableObjectMetadataItems = getSearchableObjectMetadataItems(
        targetFields,
        objectMetadataItems,
      );

      const pickableMorphItems = selectedTargetRecords.map((record) => ({
        recordId: record.recordId,
        objectMetadataId: record.objectMetadataId,
        isSelected: true,
        isMatchingSearchFilter: true,
      }));

      store.set(
        multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
          instanceId: resolvedRecordPickerInstanceId,
        }),
        pickableMorphItems,
      );

      store.set(
        multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
          { instanceId: resolvedRecordPickerInstanceId },
        ),
        searchableObjectMetadataItems,
      );

      store.set(
        multipleRecordPickerSearchFilterComponentState.atomFamily({
          instanceId: resolvedRecordPickerInstanceId,
        }),
        '',
      );

      openMultipleRecordPicker(resolvedRecordPickerInstanceId);

      performSearch({
        multipleRecordPickerInstanceId: resolvedRecordPickerInstanceId,
        forceSearchFilter: '',
        forceSearchableObjectMetadataItems: searchableObjectMetadataItems,
        forcePickableMorphItems: pickableMorphItems,
      });

      pushFocusItemToFocusStack({
        focusId: resolvedRecordPickerInstanceId,
        component: {
          type: FocusComponentType.DROPDOWN,
          instanceId: resolvedRecordPickerInstanceId,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      });
    },
    [openMultipleRecordPicker, performSearch, pushFocusItemToFocusStack, store],
  );

  return { openJunctionRelationFieldInput };
};
