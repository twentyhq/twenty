import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createFamilySelectorV2';
import { type RelationType } from 'twenty-shared/types';
import { computeMorphRelationFieldName } from 'twenty-shared/utils';

type MorphOneToManyFamilyKey = {
  recordId: string;
  morphRelations: FieldMetadataItemRelation[];
};

type MorphValueWithObjectName = {
  objectNameSingular: string;
  value: ObjectRecord[] | ObjectRecord;
};

export const recordStoreMorphOneToManyValueWithObjectNameFamilySelectorV2 =
  createFamilySelectorV2<MorphValueWithObjectName[], MorphOneToManyFamilyKey>({
    key: 'recordStoreMorphOneToManyValueWithObjectNameFamilySelectorV2',
    get:
      ({ recordId, morphRelations }: MorphOneToManyFamilyKey) =>
      ({ get }) => {
        const morphValuesWithObjectName = morphRelations.map(
          (morphRelation) => {
            const fieldName = computeMorphRelationFieldName({
              fieldName: morphRelation.sourceFieldMetadata.name,
              relationType: morphRelation.type as RelationType,
              targetObjectMetadataNameSingular:
                morphRelation.targetObjectMetadata.nameSingular,
              targetObjectMetadataNamePlural:
                morphRelation.targetObjectMetadata.namePlural,
            });
            return {
              objectNameSingular:
                morphRelation.targetObjectMetadata.nameSingular,
              value: (get(recordStoreFamilyState, recordId)?.[fieldName] ||
                []) as ObjectRecord[] | ObjectRecord,
            };
          },
        );

        return morphValuesWithObjectName;
      },
  });
