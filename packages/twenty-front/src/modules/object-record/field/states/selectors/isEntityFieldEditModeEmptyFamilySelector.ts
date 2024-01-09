import { selectorFamily } from 'recoil';

import { entityFieldsEditModeValueFamilyState } from '@/object-record/field/states/entityFieldsEditModeValueFamilyState';
import { isFieldValueEmpty } from '@/object-record/field/utils/isFieldValueEmpty';

import { FieldDefinition } from '../../types/FieldDefinition';
import { FieldMetadata } from '../../types/FieldMetadata';

export const isEntityFieldEditModeEmptyFamilySelector = selectorFamily({
  key: 'isEntityFieldEditModeEmptyFamilySelector',
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
      const fieldValue = get(entityFieldsEditModeValueFamilyState(entityId))?.[
        fieldName
      ];

      return isFieldValueEmpty({
        fieldDefinition,
        fieldValue,
      });
    };
  },
});
