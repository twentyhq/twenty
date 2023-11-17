import { selectorFamily } from 'recoil';

import { isFieldFullName } from '@/ui/object/field/types/guards/isFieldFullName';
import { isFieldFullNameValue } from '@/ui/object/field/types/guards/isFieldFullNameValue';
import { isFieldUuid } from '@/ui/object/field/types/guards/isFieldUuid';
import { assertNotNull } from '~/utils/assert';

import { FieldDefinition } from '../../types/FieldDefinition';
import { FieldMetadata } from '../../types/FieldMetadata';
import { isFieldBoolean } from '../../types/guards/isFieldBoolean';
import { isFieldChip } from '../../types/guards/isFieldChip';
import { isFieldCurrency } from '../../types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '../../types/guards/isFieldCurrencyValue';
import { isFieldDate } from '../../types/guards/isFieldDate';
import { isFieldDoubleTextChip } from '../../types/guards/isFieldDoubleTextChip';
import { isFieldEmail } from '../../types/guards/isFieldEmail';
import { isFieldLink } from '../../types/guards/isFieldLink';
import { isFieldLinkValue } from '../../types/guards/isFieldLinkValue';
import { isFieldMoney } from '../../types/guards/isFieldMoney';
import { isFieldNumber } from '../../types/guards/isFieldNumber';
import { isFieldPhone } from '../../types/guards/isFieldPhone';
import { isFieldProbability } from '../../types/guards/isFieldProbability';
import { isFieldRelation } from '../../types/guards/isFieldRelation';
import { isFieldRelationValue } from '../../types/guards/isFieldRelationValue';
import { isFieldText } from '../../types/guards/isFieldText';
import { isFieldURL } from '../../types/guards/isFieldURL';
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

      if (isFieldCurrency(fieldDefinition)) {
        const fieldName = fieldDefinition.metadata.fieldName;
        const fieldValue = get(entityFieldsFamilyState(entityId))?.[fieldName];

        return (
          !isFieldCurrencyValue(fieldValue) ||
          isValueEmpty(fieldValue?.amountMicros)
        );
      }

      if (isFieldFullName(fieldDefinition)) {
        const fieldName = fieldDefinition.metadata.fieldName;
        const fieldValue = get(entityFieldsFamilyState(entityId))?.[fieldName];

        return (
          !isFieldFullNameValue(fieldValue) ||
          isValueEmpty(fieldValue?.firstName + fieldValue?.lastName)
        );
      }

      if (isFieldLink(fieldDefinition)) {
        const fieldName = fieldDefinition.metadata.fieldName;
        const fieldValue = get(entityFieldsFamilyState(entityId))?.[fieldName];

        return !isFieldLinkValue(fieldValue) || isValueEmpty(fieldValue?.url);
      }

      throw new Error(
        `Entity field type not supported in isEntityFieldEmptyFamilySelector : ${fieldDefinition.type}}`,
      );
    };
  },
});
