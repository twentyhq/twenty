import { selectorFamily } from 'recoil';

import { FieldDefinition } from '../../types/FieldDefinition';
import { FieldMetadata } from '../../types/FieldMetadata';
import { isFieldDate } from '../../types/guards/isFieldDate';
import { isFieldPhone } from '../../types/guards/isFieldPhone';
import { isFieldText } from '../../types/guards/isFieldText';
import { isFieldURL } from '../../types/guards/isFieldURL';
import { entityFieldsFamilyState } from '../entityFieldsFamilyState';

export const isEntityFieldEmptyFamilySelector = selectorFamily({
  key: 'isEntityFieldEmptyFamilySelector',
  get: ({
    fieldDefinition,
    entityId,
  }: {
    fieldDefinition: Omit<FieldDefinition<FieldMetadata>, 'Icon'>;
    entityId: string;
  }) => {
    return ({ get }) => {
      if (
        isFieldText(fieldDefinition) ||
        isFieldURL(fieldDefinition) ||
        isFieldDate(fieldDefinition) ||
        isFieldPhone(fieldDefinition)
      ) {
        const fieldName = fieldDefinition.metadata.fieldName;
        const fieldValue = get(entityFieldsFamilyState(entityId))?.[
          fieldName
        ] as string | null;

        return (
          fieldValue === null || fieldValue === undefined || fieldValue === ''
        );
      }

      return false;
    };
  },
});
