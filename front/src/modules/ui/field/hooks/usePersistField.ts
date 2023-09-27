import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { FieldContext } from '../contexts/FieldContext';
import { entityFieldsFamilySelector } from '../states/selectors/entityFieldsFamilySelector';
import { isFieldBoolean } from '../types/guards/isFieldBoolean';
import { isFieldBooleanValue } from '../types/guards/isFieldBooleanValue';
import { isFieldChip } from '../types/guards/isFieldChip';
import { isFieldChipValue } from '../types/guards/isFieldChipValue';
import { isFieldDate } from '../types/guards/isFieldDate';
import { isFieldDateValue } from '../types/guards/isFieldDateValue';
import { isFieldDoubleText } from '../types/guards/isFieldDoubleText';
import { isFieldDoubleTextChip } from '../types/guards/isFieldDoubleTextChip';
import { isFieldDoubleTextChipValue } from '../types/guards/isFieldDoubleTextChipValue';
import { isFieldDoubleTextValue } from '../types/guards/isFieldDoubleTextValue';
import { isFieldEmail } from '../types/guards/isFieldEmail';
import { isFieldEmailValue } from '../types/guards/isFieldEmailValue';
import { isFieldMoney } from '../types/guards/isFieldMoney';
import { isFieldMoneyValue } from '../types/guards/isFieldMoneyValue';
import { isFieldNumber } from '../types/guards/isFieldNumber';
import { isFieldNumberValue } from '../types/guards/isFieldNumberValue';
import { isFieldProbability } from '../types/guards/isFieldProbability';
import { isFieldProbabilityValue } from '../types/guards/isFieldProbabilityValue';
import { isFieldRelation } from '../types/guards/isFieldRelation';
import { isFieldRelationValue } from '../types/guards/isFieldRelationValue';
import { isFieldText } from '../types/guards/isFieldText';
import { isFieldTextValue } from '../types/guards/isFieldTextValue';
import { isFieldURL } from '../types/guards/isFieldURL';
import { isFieldURLValue } from '../types/guards/isFieldURLValue';

export const usePersistField = () => {
  const { entityId, fieldDefinition, useUpdateEntityMutation } =
    useContext(FieldContext);

  const [updateEntity] = useUpdateEntityMutation();

  const persistField = useRecoilCallback(
    ({ set }) =>
      (valueToPersist: unknown) => {
        const fieldIsRelation =
          isFieldRelation(fieldDefinition) &&
          isFieldRelationValue(valueToPersist);

        const fieldIsChip =
          isFieldChip(fieldDefinition) && isFieldChipValue(valueToPersist);

        const fieldIsDoubleText =
          isFieldDoubleText(fieldDefinition) &&
          isFieldDoubleTextValue(valueToPersist);

        const fieldIsDoubleTextChip =
          isFieldDoubleTextChip(fieldDefinition) &&
          isFieldDoubleTextChipValue(valueToPersist);

        const fieldIsText =
          isFieldText(fieldDefinition) && isFieldTextValue(valueToPersist);

        const fieldIsEmail =
          isFieldEmail(fieldDefinition) && isFieldEmailValue(valueToPersist);

        const fieldIsDate =
          isFieldDate(fieldDefinition) && isFieldDateValue(valueToPersist);

        const fieldIsURL =
          isFieldURL(fieldDefinition) && isFieldURLValue(valueToPersist);

        const fieldIsBoolean =
          isFieldBoolean(fieldDefinition) &&
          isFieldBooleanValue(valueToPersist);

        const fieldIsProbability =
          isFieldProbability(fieldDefinition) &&
          isFieldProbabilityValue(valueToPersist);

        const fieldIsNumber =
          isFieldNumber(fieldDefinition) && isFieldNumberValue(valueToPersist);

        const fieldIsMoney =
          isFieldMoney(fieldDefinition) && isFieldMoneyValue(valueToPersist);

        if (fieldIsRelation) {
          const fieldName = fieldDefinition.metadata.fieldName;

          set(
            entityFieldsFamilySelector({ entityId, fieldName }),
            valueToPersist,
          );

          updateEntity({
            variables: {
              where: { id: entityId },
              data: {
                [fieldName]: valueToPersist
                  ? { connect: { id: valueToPersist.id } }
                  : { disconnect: true },
              },
            },
          });
        } else if (fieldIsChip) {
          const fieldName = fieldDefinition.metadata.contentFieldName;

          set(
            entityFieldsFamilySelector({ entityId, fieldName }),
            valueToPersist,
          );

          updateEntity({
            variables: {
              where: { id: entityId },
              data: {
                [fieldName]: valueToPersist,
              },
            },
          });
        } else if (fieldIsDoubleText || fieldIsDoubleTextChip) {
          set(
            entityFieldsFamilySelector({
              entityId,
              fieldName: fieldDefinition.metadata.firstValueFieldName,
            }),
            valueToPersist.firstValue,
          );

          set(
            entityFieldsFamilySelector({
              entityId,
              fieldName: fieldDefinition.metadata.secondValueFieldName,
            }),
            valueToPersist.secondValue,
          );

          updateEntity({
            variables: {
              where: { id: entityId },
              data: {
                [fieldDefinition.metadata.firstValueFieldName]:
                  valueToPersist.firstValue,
                [fieldDefinition.metadata.secondValueFieldName]:
                  valueToPersist.secondValue,
              },
            },
          });
        } else if (
          fieldIsText ||
          fieldIsBoolean ||
          fieldIsURL ||
          fieldIsEmail ||
          fieldIsProbability ||
          fieldIsNumber ||
          fieldIsMoney ||
          fieldIsDate
        ) {
          const fieldName = fieldDefinition.metadata.fieldName;

          set(
            entityFieldsFamilySelector({ entityId, fieldName }),
            valueToPersist,
          );

          updateEntity({
            variables: {
              where: { id: entityId },
              data: {
                [fieldName]: valueToPersist,
              },
            },
          });
        } else {
          throw new Error(
            `Invalid value to persist: ${valueToPersist} for type : ${fieldDefinition.type}, type may not be implemented in usePersistField.`,
          );
        }
      },
    [entityId, fieldDefinition, updateEntity],
  );

  return persistField;
};
