import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { EntityForSelect } from '@/ui/relation-picker/types/EntityForSelect';
import { viewFieldsState } from '@/ui/table/states/viewFieldsState';
import { EntityUpdateMutationHookContext } from '@/ui/table/states/EntityUpdateMutationHookContext';

export function useUpdateEntityField() {
  const useUpdateEntityMutation = useContext(EntityUpdateMutationHookContext);

  const [updateEntity] = useUpdateEntityMutation();

  const entityFieldMetadataArray = useRecoilValue(viewFieldsState);

  return function updatePeopleField(
    currentEntityId: string,
    fieldName: string,
    newFieldValue: unknown,
  ) {
    const fieldMetadata = entityFieldMetadataArray.find(
      (metadata) => metadata.id === fieldName,
    );

    if (!fieldMetadata) {
      throw new Error(`Field metadata not found for field ${fieldName}`);
    }

    if (fieldMetadata.type === 'relation') {
      const newSelectedEntity = newFieldValue as EntityForSelect | null;

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
    } else {
      updateEntity({
        variables: {
          where: { id: currentEntityId },
          data: { [fieldName]: newFieldValue },
        },
      });
    }
  };
}
