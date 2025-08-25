import { selectorFamily } from 'recoil';

import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { RelationType } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

export const recordStoreMorphManyToOneValueWithObjectNameFamilySelector =
  selectorFamily({
    key: 'recordStoreMorphManyToOneValueWithObjectNameFamilySelector',
    get:
      ({
        fieldName,
        recordId,
        morphRelations,
      }: {
        fieldName: string;
        recordId: string;
        morphRelations: FieldMetadataItemRelation[];
      }) =>
      ({ get }) => {
        const morphValuesWithObjectName = morphRelations.map(
          (morphRelation) => {
            const computedFieldName = computeMorphRelationFieldName({
              fieldName,
              relationDirection: RelationType.MANY_TO_ONE,
              nameSingular: morphRelation.targetObjectMetadata.nameSingular,
              namePlural: morphRelation.targetObjectMetadata.namePlural,
            });
            return {
              objectNameSingular:
                morphRelation.targetObjectMetadata.nameSingular,
              value: get(recordStoreFamilyState(recordId))?.[
                computedFieldName
              ] as ObjectRecord,
            };
          },
        );

        const morphValueFiltered = morphValuesWithObjectName.filter(
          (morphValue) => isDefined(morphValue.value),
        );
        return morphValueFiltered.length > 0 ? morphValueFiltered[0] : null;
      },
  });
