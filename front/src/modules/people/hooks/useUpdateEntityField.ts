import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { EntityForSelect } from '@/ui/relation-picker/types/EntityForSelect';
import { EntityUpdateMutationHookContext } from '@/ui/table/states/EntityUpdateMutationHookContext';
import { viewFieldsState } from '@/ui/table/states/viewFieldsState';
import { isViewFieldChip } from '@/ui/table/types/guards/isViewFieldChip';
import { isViewFieldRelation } from '@/ui/table/types/guards/isViewFieldRelation';
import { isViewFieldText } from '@/ui/table/types/guards/isViewFieldText';

export function useUpdateEntityField() {
  const useUpdateEntityMutation = useContext(EntityUpdateMutationHookContext);

  const [updateEntity] = useUpdateEntityMutation();

  const viewFields = useRecoilValue(viewFieldsState);

  return function updatePeopleField(
    currentEntityId: string,
    viewFieldId: string,
    newFieldValue: unknown,
  ) {
    const viewField = viewFields.find(
      (metadata) => metadata.id === viewFieldId,
    );

    if (!viewField) {
      throw new Error(`View field not found for id ${viewFieldId}`);
    }

    // TODO: improve type narrowing here with validation maybe ? Also validate the newFieldValue with linked type guards
    if (isViewFieldRelation(viewField)) {
      const newSelectedEntity = newFieldValue as EntityForSelect | null;

      const fieldName = viewField.metadata.fieldName;

      if (!newSelectedEntity) {
        updateEntity({
          variables: {
            where: { id: currentEntityId },
            data: {
              [fieldName]: {
                disconnect: true,
              },
            },
          },
        });
      } else {
        updateEntity({
          variables: {
            where: { id: currentEntityId },
            data: {
              [fieldName]: {
                connect: { id: newSelectedEntity.id },
              },
            },
          },
        });
      }
    } else if (isViewFieldChip(viewField)) {
      const newContent = newFieldValue as string;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [viewField.metadata.contentFieldName]: newContent },
        },
      });
    } else if (isViewFieldText(viewField)) {
      const newContent = newFieldValue as string;

      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [viewField.metadata.fieldName]: newContent },
        },
      });
    }
  };
}
