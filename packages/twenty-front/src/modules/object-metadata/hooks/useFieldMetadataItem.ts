import { useDeleteOneRelationMetadataItem } from '@/object-metadata/hooks/useDeleteOneRelationMetadataItem';
import { Field, FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldMetadataItem } from '../types/FieldMetadataItem';
import { formatFieldMetadataItemInput } from '../utils/formatFieldMetadataItemInput';

import { isDefined } from 'twenty-shared/utils';
import { useCreateOneFieldMetadataItem } from './useCreateOneFieldMetadataItem';
import { useDeleteOneFieldMetadataItem } from './useDeleteOneFieldMetadataItem';
import { useUpdateOneFieldMetadataItem } from './useUpdateOneFieldMetadataItem';

export const useFieldMetadataItem = () => {
  const { createOneFieldMetadataItem } = useCreateOneFieldMetadataItem();
  const { updateOneFieldMetadataItem } = useUpdateOneFieldMetadataItem();
  const { deleteOneFieldMetadataItem } = useDeleteOneFieldMetadataItem();
  const { deleteOneRelationMetadataItem } = useDeleteOneRelationMetadataItem();

  const createMetadataField = (
    input: Pick<
      Field,
      | 'name'
      | 'label'
      | 'icon'
      | 'description'
      | 'defaultValue'
      | 'type'
      | 'options'
      | 'settings'
      | 'isLabelSyncedWithName'
    > & {
      objectMetadataId: string;
    },
  ) => {
    const formattedInput = formatFieldMetadataItemInput(input);

    return createOneFieldMetadataItem({
      ...formattedInput,
      objectMetadataId: input.objectMetadataId,
      type: input.type,
      label: formattedInput.label ?? '',
      name: formattedInput.name ?? '',
      isLabelSyncedWithName: formattedInput.isLabelSyncedWithName ?? true,
    });
  };

  const activateMetadataField = (
    fieldMetadataId: string,
    objectMetadataId: string,
  ) =>
    updateOneFieldMetadataItem({
      objectMetadataId: objectMetadataId,
      fieldMetadataIdToUpdate: fieldMetadataId,
      updatePayload: { isActive: true },
    });

  const deactivateMetadataField = (
    fieldMetadataId: string,
    objectMetadataId: string,
  ) =>
    updateOneFieldMetadataItem({
      objectMetadataId: objectMetadataId,
      fieldMetadataIdToUpdate: fieldMetadataId,
      updatePayload: { isActive: false },
    });

  const deleteMetadataField = (metadataField: FieldMetadataItem) => {
    return metadataField.type === FieldMetadataType.RELATION &&
      !isDefined(metadataField.settings?.relationType)
      ? deleteOneRelationMetadataItem(
          metadataField.relationDefinition?.relationId,
        )
      : deleteOneFieldMetadataItem(metadataField.id);
  };

  return {
    activateMetadataField,
    createMetadataField,
    deactivateMetadataField,
    deleteMetadataField,
  };
};
