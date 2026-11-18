import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';

export const addFieldMetadataOptionDeletionsToOperationRecord = ({
  allFlatEntityOperationRecordByMetadataName,
  flatFieldMetadataOptionsToDelete,
}: {
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
  flatFieldMetadataOptionsToDelete: FlatFieldMetadataOption[];
}): AllFlatEntityOperationRecordByMetadataName => {
  const fieldMetadataOptionOperationRecord =
    allFlatEntityOperationRecordByMetadataName.fieldMetadataOption;

  // Set even when empty: a sync passes every option operation it wants explicitly.
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
