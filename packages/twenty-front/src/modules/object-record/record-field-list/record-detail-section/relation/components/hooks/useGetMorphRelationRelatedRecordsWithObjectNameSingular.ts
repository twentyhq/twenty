import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { recordStoreMorphOneToManyValueWithObjectNameFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreMorphOneToManyValueWithObjectNameFamilySelector';
import { useRecoilValue } from 'recoil';
import { CustomError, isNonEmptyArray } from 'twenty-shared/utils';

export const useGetMorphRelationRelatedRecordsWithObjectNameSingular = ({
  recordId,
  morphRelations,
}: {
  recordId: string;
  morphRelations: FieldMetadataItemRelation[];
}) => {
  const morphRelationObjectNameSingularWithValues = useRecoilValue(
    recordStoreMorphOneToManyValueWithObjectNameFamilySelector({
      recordId,
      morphRelations,
    }),
  );

  if (morphRelations.length < 1) {
    throw new CustomError(
      'Cannot load relation records: no morph relations were provided to this component.',
      'MORPH_RELATIONS_REQUIRED',
    );
  }

  const morphRelationObjectNameSingularWithValuesArray =
    morphRelationObjectNameSingularWithValues
      .map((recordWithObjectNameSingular) => ({
        ...recordWithObjectNameSingular,
        value: Array.isArray(recordWithObjectNameSingular.value)
          ? recordWithObjectNameSingular.value
          : recordWithObjectNameSingular.value
            ? [recordWithObjectNameSingular.value]
            : [],
      }))
      .filter((recordWithObjectNameSingular) =>
        isNonEmptyArray(recordWithObjectNameSingular.value),
      );

  const recordsWithObjectNameSingular =
    morphRelationObjectNameSingularWithValuesArray.flatMap(
      (recordWithObjectNameSingular) => {
        const fieldMetadataId = morphRelations.find(
          (morphRelation) =>
            morphRelation.targetObjectMetadata.nameSingular ===
            recordWithObjectNameSingular.objectNameSingular,
        )?.targetFieldMetadata.id;
        if (!fieldMetadataId) {
          return [];
        }

        return recordWithObjectNameSingular.value.map((value) => ({
          objectNameSingular: recordWithObjectNameSingular.objectNameSingular,
          value: value,
          fieldMetadataId,
        }));
      },
    );
  return recordsWithObjectNameSingular;
};
