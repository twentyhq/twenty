import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';

import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreMorphOneToManyValueWithObjectNameFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreMorphOneToManyValueWithObjectNameFamilySelector';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilCallback } from 'recoil';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useOpenMorphRelationOneToManyFieldInput = () => {
  const { performSearch } = useMultipleRecordPickerPerformSearch();
  const { openMultipleRecordPicker } = useMultipleRecordPickerOpen();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const openMorphRelationOneToManyFieldInput = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        recordId,
        prefix,
        fieldDefinition,
      }: {
        recordId: string;
        prefix?: string;
        fieldDefinition: FieldDefinition<FieldMorphRelationMetadata>;
      }) => {
        const recordPickerInstanceId = getRecordFieldInputInstanceId({
          recordId,
          fieldName: fieldDefinition.metadata.fieldName,
          prefix,
        });

        const objectNameSingulars = fieldDefinition.metadata.morphRelations.map(
          ({ targetObjectMetadata }) => targetObjectMetadata.nameSingular,
        );

        const morphValuesWithObjectNameSingularFieldValue = snapshot
          .getLoadable(
            recordStoreMorphOneToManyValueWithObjectNameFamilySelector({
              recordId,
              morphRelations: fieldDefinition.metadata.morphRelations,
            }),
          )
          .getValue();

        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        const objectMetadataItemArray = objectMetadataItems.filter(
          (objectMetadataItem) =>
            objectNameSingulars.includes(objectMetadataItem.nameSingular),
        );

        if (
          !isDefined(objectMetadataItemArray) ||
          objectMetadataItemArray.length === 0
        ) {
          return;
        }

        openMultipleRecordPicker(recordPickerInstanceId);

        const pickableMorphItems: RecordPickerPickableMorphItem[] =
          morphValuesWithObjectNameSingularFieldValue.flatMap(
            (recordWithObjectNameSingular) => {
              const objectMetadataItem = objectMetadataItemArray.find(
                (objectMetadataItem) =>
                  objectMetadataItem.nameSingular ===
                  recordWithObjectNameSingular.objectNameSingular,
              );

              if (!objectMetadataItem) {
                return [];
              }

              return recordWithObjectNameSingular.value.map(
                (recordValue: ObjectRecord) => ({
                  objectMetadataId: objectMetadataItem.id,
                  recordId: recordValue.id,
                  isSelected: true,
                  isMatchingSearchFilter: true,
                }),
              );
            },
          );

        const records = morphValuesWithObjectNameSingularFieldValue.flatMap(
          (recordWithObjectNameSingular) => recordWithObjectNameSingular.value,
        );

        for (const record of records) {
          set(recordStoreFamilyState(record.id), record);
        }

        set(
          multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
            instanceId: recordPickerInstanceId,
          }),
          pickableMorphItems,
        );

        set(
          multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
            { instanceId: recordPickerInstanceId },
          ),
          objectMetadataItemArray,
        );

        performSearch({
          multipleRecordPickerInstanceId: recordPickerInstanceId,
          forceSearchFilter: '',
          forceSearchableObjectMetadataItems: objectMetadataItemArray,
          forcePickableMorphItems: pickableMorphItems,
        });

        pushFocusItemToFocusStack({
          focusId: recordPickerInstanceId,
          component: {
            type: FocusComponentType.DROPDOWN,
            instanceId: recordPickerInstanceId,
          },
          globalHotkeysConfig: {
            enableGlobalHotkeysConflictingWithKeyboard: false,
          },
        });
      },
    [openMultipleRecordPicker, performSearch, pushFocusItemToFocusStack],
  );

  return {
    openMorphRelationOneToManyFieldInput,
  };
};
