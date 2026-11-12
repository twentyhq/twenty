import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';

export const addFieldMetadataOptionDeletionsToOperationRecord = ({
  allFlatEntityOperationRecordByMetadataName,
  flatFieldMetadataOptionsToDelete,
}: {
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
  flatFieldMetadataOptionsToDelete: FlatFieldMetadataOption[];
}): AllFlatEntityOperationRecordByMetadataName => {
  if (flatFieldMetadataOptionsToDelete.length === 0) {
    return allFlatEntityOperationRecordByMetadataName;
  }

  const fieldMetadataOptionOperationRecord =
    allFlatEntityOperationRecordByMetadataName.fieldMetadataOption;

  return {
    ...allFlatEntityOperationRecordByMetadataName,
    fieldMetadataOption: {
      flatEntityToCreate:
        fieldMetadataOptionOperationRecord?.flatEntityToCreate ?? {},
      flatEntityToUpdate:
        fieldMetadataOptionOperationRecord?.flatEntityToUpdate ?? {},
      flatEntityToDelete: {
        ...fieldMetadataOptionOperationRecord?.flatEntityToDelete,
        ...Object.fromEntries(
          flatFieldMetadataOptionsToDelete.map((flatFieldMetadataOption) => [
            flatFieldMetadataOption.universalIdentifier,
            flatFieldMetadataOption,
          ]),
        ),
      },
    },
  };
};
