import { selectorFamily } from 'recoil';

import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

export const recordStoreMorphManyToOneValueWithObjectNameFamilySelector =
  selectorFamily({
    key: 'recordStoreMorphManyToOneValueWithObjectNameFamilySelector',
    get:
      ({
        recordId,
        morphRelations,
      }: {
        recordId: string;
        morphRelations: FieldMetadataItemRelation[];
      }) =>
      ({ get }) => {
        const morphValuesWithObjectName = morphRelations.map(
          (morphRelation) => {
            return {
              objectNameSingular:
                morphRelation.targetObjectMetadata.nameSingular,
              value: get(recordStoreFamilyState(recordId))?.[
                morphRelation.sourceFieldMetadata.name
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
