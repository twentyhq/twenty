import { selectorFamily } from 'recoil';

import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const recordStoreMorphOneToManyValueWithObjectNameFamilySelector =
  selectorFamily({
    key: 'recordStoreMorphOneToManyValueWithObjectNameFamilySelector',
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
            return {
              objectNameSingular:
                morphRelation.targetObjectMetadata.nameSingular,
              value: (get(recordStoreFamilyState(recordId))?.[fieldName] ||
                []) as ObjectRecord[],
            };
          },
        );

        return morphValuesWithObjectName;
      },
  });
