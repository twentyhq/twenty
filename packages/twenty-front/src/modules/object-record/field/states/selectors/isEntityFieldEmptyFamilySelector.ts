import { selectorFamily } from 'recoil';

import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { isFieldValueEmpty } from '@/object-record/field/utils/isFieldValueEmpty';

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
      const fieldValue = get(entityFieldsFamilyState(entityId))?.[fieldName];

      return isFieldValueEmpty({
        fieldDefinition,
        fieldValue,
      });
    };
  },
});
