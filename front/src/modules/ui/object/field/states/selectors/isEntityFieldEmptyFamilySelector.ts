import { selectorFamily } from 'recoil';

import { isFieldUuid } from '@/ui/object/field/types/guards/isFieldUuid';
import { assertNotNull } from '~/utils/assert';

import { FieldDefinition } from '../../types/FieldDefinition';
import { FieldMetadata } from '../../types/FieldMetadata';
import { isFieldBoolean } from '../../types/guards/isFieldBoolean';
import { isFieldChip } from '../../types/guards/isFieldChip';
import { isFieldDate } from '../../types/guards/isFieldDate';
import { isFieldDoubleTextChip } from '../../types/guards/isFieldDoubleTextChip';
import { isFieldEmail } from '../../types/guards/isFieldEmail';
import { isFieldMoney } from '../../types/guards/isFieldMoney';
import { isFieldMoneyAmountV2 } from '../../types/guards/isFieldMoneyAmountV2';
import { isFieldMoneyAmountV2Value } from '../../types/guards/isFieldMoneyAmountV2Value';
import { isFieldNumber } from '../../types/guards/isFieldNumber';
import { isFieldPhone } from '../../types/guards/isFieldPhone';
import { isFieldProbability } from '../../types/guards/isFieldProbability';
import { isFieldRelation } from '../../types/guards/isFieldRelation';
import { isFieldRelationValue } from '../../types/guards/isFieldRelationValue';
import { isFieldText } from '../../types/guards/isFieldText';
import { isFieldURL } from '../../types/guards/isFieldURL';
import { isFieldURLV2 } from '../../types/guards/isFieldURLV2';
import { isFieldURLV2Value } from '../../types/guards/isFieldURLV2Value';
import { entityFieldsFamilyState } from '../entityFieldsFamilyState';

const isValueEmpty = (value: unknown) => !assertNotNull(value) || value === '';

export const isEntityFieldEmptyFamilySelector = selectorFamily({
  key: 'isEntityFieldEmptyFamilySelector',
  get: ({
    fieldDefinition,
    entityId,
  }: {
    fieldDefinition: Pick<
      FieldDefinition<FieldMetadata>,
      'type' | 'metadata' | 'fieldMetadataId' | 'label'
    >;
    entityId: string;
  }) => {
    return ({ get }) => {
      if (
        isFieldUuid(fieldDefinition) ||
        isFieldText(fieldDefinition) ||
        isFieldURL(fieldDefinition) ||
        isFieldDate(fieldDefinition) ||
        isFieldNumber(fieldDefinition) ||
        isFieldProbability(fieldDefinition) ||
        isFieldMoney(fieldDefinition) ||
        isFieldEmail(fieldDefinition) ||
        isFieldBoolean(fieldDefinition) ||
        isFieldPhone(fieldDefinition)
      ) {
        const fieldName = fieldDefinition.metadata.fieldName;
        const fieldValue = get(entityFieldsFamilyState(entityId))?.[
          fieldName
        ] as string | number | boolean | null;

        return isValueEmpty(fieldValue);
      }

      if (isFieldRelation(fieldDefinition)) {
        const fieldName = fieldDefinition.metadata.fieldName;

        const fieldValue = get(entityFieldsFamilyState(entityId))?.[fieldName];

        return isFieldRelationValue(fieldValue) && isValueEmpty(fieldValue);
      }

      if (isFieldChip(fieldDefinition)) {
        const contentFieldName = fieldDefinition.metadata.contentFieldName;

        const contentFieldValue = get(entityFieldsFamilyState(entityId))?.[
          contentFieldName
        ] as string | null;

        return isValueEmpty(contentFieldValue);
      }

      if (isFieldDoubleTextChip(fieldDefinition)) {
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
          isValueEmpty(contentFieldFirstValue) &&
          isValueEmpty(contentFieldSecondValue)
        );
      }

      if (isFieldMoneyAmountV2(fieldDefinition)) {
        const fieldName = fieldDefinition.metadata.fieldName;
        const fieldValue = get(entityFieldsFamilyState(entityId))?.[fieldName];

        return (
          !isFieldMoneyAmountV2Value(fieldValue) ||
          isValueEmpty(fieldValue?.amount)
        );
      }

      if (isFieldURLV2(fieldDefinition)) {
        const fieldName = fieldDefinition.metadata.fieldName;
        const fieldValue = get(entityFieldsFamilyState(entityId))?.[fieldName];

        return !isFieldURLV2Value(fieldValue) || isValueEmpty(fieldValue?.link);
      }

      throw new Error(
        `Entity field type not supported in isEntityFieldEmptyFamilySelector : ${fieldDefinition.type}}`,
      );
    };
  },
});
