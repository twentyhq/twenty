import { selectorFamily } from 'recoil';

import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type RelationType } from 'twenty-shared/types';
import { computeMorphRelationFieldName } from 'twenty-shared/utils';

export const recordStoreMorphOneToManyValueWithObjectNameFamilySelector =
  selectorFamily({
    key: 'recordStoreMorphOneToManyValueWithObjectNameFamilySelector',
    get:
      ({
        recordId,
        morphRelations,
      }: {
        recordId: string;
        morphRelations: FieldMetadataItemRelation[];
      }) =>
      () => {
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
              value:
                (jotaiStore.get(
                  recordStoreFamilyState.atomFamily(recordId),
                )?.[fieldName] || []) as ObjectRecord[] | ObjectRecord,
            };
          },
        );

        return morphValuesWithObjectName;
      },
  });
