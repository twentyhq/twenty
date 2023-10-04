import { selectorFamily } from 'recoil';

import { FieldDefinition } from '../../types/FieldDefinition';
import { FieldMetadata } from '../../types/FieldMetadata';
import { isFieldChip } from '../../types/guards/isFieldChip';
import { isFieldDate } from '../../types/guards/isFieldDate';
import { isFieldDoubleTextChip } from '../../types/guards/isFieldDoubleTextChip';
import { isFieldEmail } from '../../types/guards/isFieldEmail';
import { isFieldMoney } from '../../types/guards/isFieldMoney';
import { isFieldNumber } from '../../types/guards/isFieldNumber';
import { isFieldPhone } from '../../types/guards/isFieldPhone';
import { isFieldRelation } from '../../types/guards/isFieldRelation';
import { isFieldRelationValue } from '../../types/guards/isFieldRelationValue';
import { isFieldText } from '../../types/guards/isFieldText';
import { isFieldURL } from '../../types/guards/isFieldURL';
import { entityFieldsFamilyState } from '../entityFieldsFamilyState';

export const isEntityFieldEmptyFamilySelector = selectorFamily({
  key: 'isEntityFieldEmptyFamilySelector',
  get: ({
    fieldDefinition,
    entityId,
  }: {
    fieldDefinition: Pick<
      FieldDefinition<FieldMetadata>,
      'type' | 'metadata' | 'key' | 'name'
    >;
    entityId: string;
  }) => {
    return ({ get }) => {
      if (
        isFieldText(fieldDefinition) ||
        isFieldURL(fieldDefinition) ||
        isFieldDate(fieldDefinition) ||
        isFieldNumber(fieldDefinition) ||
        isFieldMoney(fieldDefinition) ||
        isFieldEmail(fieldDefinition) ||
        isFieldPhone(fieldDefinition)
      ) {
        const fieldName = fieldDefinition.metadata.fieldName;
        const fieldValue = get(entityFieldsFamilyState(entityId))?.[
          fieldName
        ] as string | null;

        return (
          fieldValue === null || fieldValue === undefined || fieldValue === ''
        );
      } else if (isFieldRelation(fieldDefinition)) {
        const fieldName = fieldDefinition.metadata.fieldName;

        const fieldValue = get(entityFieldsFamilyState(entityId))?.[fieldName];

        if (isFieldRelationValue(fieldValue)) {
          return fieldValue === null || fieldValue === undefined;
        }
      } else if (isFieldChip(fieldDefinition)) {
        const contentFieldName = fieldDefinition.metadata.contentFieldName;

        const contentFieldValue = get(entityFieldsFamilyState(entityId))?.[
          contentFieldName
        ] as string | null;

        return (
          contentFieldValue === null ||
          contentFieldValue === undefined ||
          contentFieldValue === ''
        );
      } else if (isFieldDoubleTextChip(fieldDefinition)) {
        const firstValueFieldName =
          fieldDefinition.metadata.firstValueFieldName;

        const secondValueFieldName =
          fieldDefinition.metadata.secondValueFieldName;

        const contentFieldFirstValue = get(entityFieldsFamilyState(entityId))?.[
          firstValueFieldName
        ] as string | null;

        const contentFieldSecondValue = get(
          entityFieldsFamilyState(entityId),
        )?.[secondValueFieldName] as string | null;

        return (
          (contentFieldFirstValue === null ||
            contentFieldFirstValue === undefined ||
            contentFieldFirstValue === '') &&
          (contentFieldSecondValue === null ||
            contentFieldSecondValue === undefined ||
            contentFieldSecondValue === '')
        );
      }

      return false;
    };
  },
});
