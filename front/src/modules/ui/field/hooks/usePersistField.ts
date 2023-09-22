import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { genericEntityFieldFamilySelector } from '@/ui/editable-field/states/selectors/genericEntityFieldFamilySelector';

import { FieldContext } from '../contexts/FieldContext';
import { fieldValueForPersistFamilyState } from '../states/fieldValueForPersistFamilyState';
import { isFieldRelation } from '../types/guards/isFieldRelation';
import { isFieldText } from '../types/guards/isFieldText';

export const usePersistField = () => {
  const { entityId, fieldDefinition, useUpdateEntityMutation } =
    useContext(FieldContext);

  const [updateEntity] = useUpdateEntityMutation();

  const persistField = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        if (isFieldRelation(fieldDefinition)) {
          const fieldName = fieldDefinition.metadata.fieldName;

          const fieldValueToPersist = snapshot
            .getLoadable(
              fieldValueForPersistFamilyState({
                entityId,
                fieldName,
              }),
            )
            .valueOrThrow();

          set(
            genericEntityFieldFamilySelector({ entityId, fieldName }),
            fieldValueToPersist,
          );

          updateEntity({
            variables: {
              where: { id: entityId },
              data: {
                [fieldName]: fieldValueToPersist
                  ? { connect: { id: fieldValueToPersist.id } }
                  : { disconnect: true },
              },
            },
          });
        } else if (isFieldText(fieldDefinition)) {
          const fieldName = fieldDefinition.metadata.fieldName;

          const fieldValueToPersist = snapshot
            .getLoadable(
              fieldValueForPersistFamilyState({
                entityId,
                fieldName,
              }),
            )
            .valueOrThrow();

          set(
            genericEntityFieldFamilySelector({ entityId, fieldName }),
            fieldValueToPersist,
          );

          updateEntity({
            variables: {
              where: { id: entityId },
              data: {
                [fieldDefinition.metadata.fieldName]: fieldValueToPersist,
              },
            },
          });
        }
      },
    [entityId, fieldDefinition, updateEntity],
  );

  return persistField;
};
