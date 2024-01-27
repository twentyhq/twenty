import { selectorFamily } from 'recoil';

import { isFieldValueEmpty } from '@/object-record/field/utils/isFieldValueEmpty';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

import { FieldDefinition } from '../../types/FieldDefinition';
import { FieldMetadata } from '../../types/FieldMetadata';

export const isEntityFieldEmptyFamilySelector = selectorFamily({
  key: 'isEntityFieldEmptyFamilySelector',
  get: ({
    fieldDefinition,
    fieldName,
    entityId,
  }: {
    fieldDefinition: Pick<FieldDefinition<FieldMetadata>, 'type'>;
    fieldName: string;
    entityId: string;
  }) => {
    return ({ get }) => {
      const fieldValue = get(recordStoreFamilyState(entityId))?.[fieldName];

      return isFieldValueEmpty({
        fieldDefinition,
        fieldValue,
      });
    };
  },
});
