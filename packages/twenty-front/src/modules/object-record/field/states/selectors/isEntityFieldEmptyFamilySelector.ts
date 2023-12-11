import { selectorFamily } from 'recoil';

import { isFieldFullName } from '@/object-record/field/types/guards/isFieldFullName';
import { isFieldFullNameValue } from '@/object-record/field/types/guards/isFieldFullNameValue';
import { isFieldSelect } from '@/object-record/field/types/guards/isFieldSelect';
import { isFieldUuid } from '@/object-record/field/types/guards/isFieldUuid';
import { assertNotNull } from '~/utils/assert';

import { FieldDefinition } from '../../types/FieldDefinition';
import { FieldMetadata } from '../../types/FieldMetadata';
import { isFieldBoolean } from '../../types/guards/isFieldBoolean';
import { isFieldCurrency } from '../../types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '../../types/guards/isFieldCurrencyValue';
import { isFieldDateTime } from '../../types/guards/isFieldDateTime';
import { isFieldEmail } from '../../types/guards/isFieldEmail';
import { isFieldLink } from '../../types/guards/isFieldLink';
import { isFieldLinkValue } from '../../types/guards/isFieldLinkValue';
import { isFieldNumber } from '../../types/guards/isFieldNumber';
import { isFieldRating } from '../../types/guards/isFieldRating';
import { isFieldRelation } from '../../types/guards/isFieldRelation';
import { isFieldRelationValue } from '../../types/guards/isFieldRelationValue';
import { isFieldText } from '../../types/guards/isFieldText';
import { entityFieldsFamilyState } from '../entityFieldsFamilyState';

const isValueEmpty = (value: unknown) => !assertNotNull(value) || value === '';

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
      if (
        isFieldUuid(fieldDefinition) ||
        isFieldText(fieldDefinition) ||
        isFieldDateTime(fieldDefinition) ||
        isFieldNumber(fieldDefinition) ||
        isFieldRating(fieldDefinition) ||
        isFieldEmail(fieldDefinition) ||
        isFieldBoolean(fieldDefinition) ||
        isFieldSelect(fieldDefinition)
        //|| isFieldPhone(fieldDefinition)
      ) {
        const fieldValue = get(entityFieldsFamilyState(entityId))?.[
          fieldName
        ] as string | number | boolean | null;

        return isValueEmpty(fieldValue);
      }

      if (isFieldRelation(fieldDefinition)) {
        const fieldValue = get(entityFieldsFamilyState(entityId))?.[fieldName];

        return isFieldRelationValue(fieldValue) && isValueEmpty(fieldValue);
      }

      if (isFieldCurrency(fieldDefinition)) {
        const fieldValue = get(entityFieldsFamilyState(entityId))?.[fieldName];

        return (
          !isFieldCurrencyValue(fieldValue) ||
          isValueEmpty(fieldValue?.amountMicros)
        );
      }

      if (isFieldFullName(fieldDefinition)) {
        const fieldValue = get(entityFieldsFamilyState(entityId))?.[fieldName];

        return (
          !isFieldFullNameValue(fieldValue) ||
          isValueEmpty(fieldValue?.firstName + fieldValue?.lastName)
        );
      }

      if (isFieldLink(fieldDefinition)) {
        const fieldValue = get(entityFieldsFamilyState(entityId))?.[fieldName];

        return !isFieldLinkValue(fieldValue) || isValueEmpty(fieldValue?.url);
      }

      throw new Error(
        `Entity field type not supported in isEntityFieldEmptyFamilySelector : ${fieldDefinition.type}}`,
      );
    };
  },
});
