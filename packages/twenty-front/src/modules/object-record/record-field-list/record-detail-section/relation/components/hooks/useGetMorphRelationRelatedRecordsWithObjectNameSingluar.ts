import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { recordStoreMorphOneToManyValueWithObjectNameFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreMorphOneToManyValueWithObjectNameFamilySelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilValue } from 'recoil';
import { RelationType } from 'twenty-shared/types';

export const useGetMorphRelationRelatedRecordsWithObjectNameSingluar = ({
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

  const morphRelationObjectNameSingularWithValuesArray =
    morphRelationObjectNameSingularWithValues.map(
      (recordWithObjectNameSingular) => {
        const newRecordWithObjectNameSingular = {
          ...recordWithObjectNameSingular,
          value:
            morphRelations[0].type === RelationType.MANY_TO_ONE
              ? [recordWithObjectNameSingular.value as ObjectRecord]
              : ((recordWithObjectNameSingular.value as ObjectRecord[]) ?? []),
        };
        return newRecordWithObjectNameSingular;
      },
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
