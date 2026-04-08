import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { type ObjectRecordOperationUpdateInput } from '@/object-record/types/ObjectRecordOperationUpdateInput';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, mapById } from 'twenty-shared/utils';

type ShouldInitializeRecordBoardFromUpdateInputsArgs = {
  updateInputs: ObjectRecordOperationUpdateInput[];
  activeFieldMetadataItems: FieldMetadataItem[];
  currentRecordFilters: RecordFilter[];
  currentRecordSorts: RecordSort[];
  recordIndexGroupFieldMetadataItem?: Pick<FieldMetadataItem, 'id'> | null;
};

export const shouldInitializeRecordBoardFromUpdateInputs = ({
  updateInputs,
  activeFieldMetadataItems,
  currentRecordFilters,
  currentRecordSorts,
  recordIndexGroupFieldMetadataItem,
}: ShouldInitializeRecordBoardFromUpdateInputsArgs) => {
  for (const updateInput of updateInputs) {
    const fieldNamesForUpdateInput = updateInput.updatedFields.flatMap(
      (updatedField) => Object.keys(updatedField ?? {}),
    );

    const updatedFieldMetadataItems = activeFieldMetadataItems.filter(
      (fieldMetadataItemToFilter) =>
        fieldNamesForUpdateInput.includes(fieldMetadataItemToFilter.name) ||
        (fieldMetadataItemToFilter.type === FieldMetadataType.RELATION &&
          fieldNamesForUpdateInput.includes(
            `${fieldMetadataItemToFilter.name}Id`,
          )),
    );

    const updatedFieldMetadataItemIds = updatedFieldMetadataItems.map(mapById);

    const updateOnAFilteredField = currentRecordFilters.some((recordFilter) =>
      updatedFieldMetadataItemIds.includes(recordFilter.fieldMetadataId),
    );

    const updateOnASortedField = currentRecordSorts.some((recordSort) =>
      updatedFieldMetadataItemIds.includes(recordSort.fieldMetadataId),
    );

    const updateOnAGroupField =
      isDefined(recordIndexGroupFieldMetadataItem) &&
      updatedFieldMetadataItemIds.includes(recordIndexGroupFieldMetadataItem.id);

    if (
      updateOnAFilteredField ||
      updateOnASortedField ||
      updateOnAGroupField
    ) {
      return true;
    }
  }

  return false;
};
