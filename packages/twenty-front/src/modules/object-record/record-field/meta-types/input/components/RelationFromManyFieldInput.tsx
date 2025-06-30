import { useContext } from 'react';

import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { useUpdateActivityTargetFromCell } from '@/activities/inline-cell/hooks/useUpdateActivityTargetFromCell';
import { NoteTarget } from '@/activities/types/NoteTarget';
import { TaskTarget } from '@/activities/types/TaskTarget';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useRelationField } from '@/object-record/record-field/meta-types/hooks/useRelationField';
import { useAddNewRecordAndOpenRightDrawer } from '@/object-record/record-field/meta-types/input/hooks/useAddNewRecordAndOpenRightDrawer';
import { useUpdateRelationFromManyFieldInput } from '@/object-record/record-field/meta-types/input/hooks/useUpdateRelationFromManyFieldInput';
import { recordFieldInputLayoutDirectionComponentState } from '@/object-record/record-field/states/recordFieldInputLayoutDirectionComponentState';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { getFieldInputInstanceId } from '@/object-record/record-field/utils/getFieldInputInstanceId';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type RelationFromManyFieldInputProps = {
  onSubmit?: FieldInputEvent;
};

export const RelationFromManyFieldInput = ({
  onSubmit,
}: RelationFromManyFieldInputProps) => {
  const { fieldDefinition, recordId } = useContext(FieldContext);
  const recordPickerInstanceId = getFieldInputInstanceId({
    recordId,
    fieldName: fieldDefinition.metadata.fieldName,
  });

  const { updateRelation } = useUpdateRelationFromManyFieldInput();
  const fieldName = fieldDefinition.metadata.fieldName;
  const objectMetadataNameSingular =
    fieldDefinition.metadata.objectMetadataNameSingular;

  const { updateActivityTargetFromCell } = useUpdateActivityTargetFromCell({
    activityObjectNameSingular: objectMetadataNameSingular as
      | CoreObjectNameSingular.Note
      | CoreObjectNameSingular.Task,
    activityId: recordId,
  });

  const { fieldValue } = useRelationField();

  const handleSubmit = () => {
    onSubmit?.(() => {});
  };

  const isRelationFromActivityTargets =
    (fieldName === 'noteTargets' &&
      objectMetadataNameSingular === CoreObjectNameSingular.Note) ||
    (fieldName === 'taskTargets' &&
      objectMetadataNameSingular === CoreObjectNameSingular.Task);

  const { activityTargetObjectRecords } = useActivityTargetObjectRecords(
    recordId,
    fieldValue as NoteTarget[] | TaskTarget[],
  );

  const relationFieldDefinition =
    fieldDefinition as FieldDefinition<FieldRelationMetadata>;

  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular:
        relationFieldDefinition.metadata.relationObjectMetadataNameSingular,
    });

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === relationFieldDefinition.metadata.relationFieldMetadataId,
  );

  const { createNewRecordAndOpenRightDrawer } =
    useAddNewRecordAndOpenRightDrawer({
      relationObjectMetadataNameSingular:
        relationFieldDefinition.metadata.relationObjectMetadataNameSingular,
      relationObjectMetadataItem,
      relationFieldMetadataItem,
      recordId,
    });

  const layoutDirection = useRecoilComponentValueV2(
    recordFieldInputLayoutDirectionComponentState,
  );

  const multipleRecordPickerPickableMorphItemsCallbackState =
    useRecoilComponentCallbackStateV2(
      multipleRecordPickerPickableMorphItemsComponentState,
      recordPickerInstanceId,
    );
  const { performSearch: multipleRecordPickerPerformSearch } =
    useMultipleRecordPickerPerformSearch();

  const handleCreateNew = useRecoilCallback(
    ({ snapshot, set }) =>
      async (searchInput?: string) => {
        const newRecordId =
          await createNewRecordAndOpenRightDrawer?.(searchInput);

        if (!isDefined(newRecordId)) {
          return;
        }

        const multipleRecordPickerPickableMorphItems = snapshot
          .getLoadable(multipleRecordPickerPickableMorphItemsCallbackState)
          .getValue();

        const newMorphItems = multipleRecordPickerPickableMorphItems.concat({
          recordId: newRecordId,
          objectMetadataId: relationObjectMetadataItem.id,
          isSelected: true,
          isMatchingSearchFilter: true,
        });

        set(multipleRecordPickerPickableMorphItemsCallbackState, newMorphItems);

        multipleRecordPickerPerformSearch({
          multipleRecordPickerInstanceId: recordPickerInstanceId,
          forceSearchFilter: searchInput,
          forceSearchableObjectMetadataItems: [relationObjectMetadataItem],
          forcePickableMorphItems: newMorphItems,
        });
      },
    [
      createNewRecordAndOpenRightDrawer,
      relationObjectMetadataItem,
      recordPickerInstanceId,
      multipleRecordPickerPickableMorphItemsCallbackState,
      multipleRecordPickerPerformSearch,
    ],
  );

  const canCreateNew = !isRelationFromActivityTargets;

  return (
    <MultipleRecordPicker
      focusId={recordPickerInstanceId}
      componentInstanceId={recordPickerInstanceId}
      onSubmit={handleSubmit}
      onChange={(morphItem) => {
        if (isRelationFromActivityTargets) {
          updateActivityTargetFromCell({
            morphItem,
            activityTargetWithTargetRecords: activityTargetObjectRecords,
            recordPickerInstanceId,
          });
        } else {
          updateRelation(morphItem);
        }
      }}
      onCreate={canCreateNew ? handleCreateNew : undefined}
      onClickOutside={handleSubmit}
      layoutDirection={
        layoutDirection === 'downward'
          ? 'search-bar-on-top'
          : 'search-bar-on-bottom'
      }
    />
  );
};
