import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { recordStoreMorphOneToManyValueWithObjectNameFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreMorphOneToManyValueWithObjectNameFamilySelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
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
        value: (recordWithObjectNameSingular.value as ObjectRecord[]) ?? [],
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
  // console.log(recordsWithObjectNameSingular);
  // if (recordId === 'f0dcb041-a731-4e28-abb6-aa4e4fafc8c9') {
  //   debugger;
  // }
  return recordsWithObjectNameSingular;
};
