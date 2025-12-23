import { type Field } from '~/generated-metadata/graphql';

import { formatFieldMetadataItemInput } from '@/object-metadata/utils/formatFieldMetadataItemInput';

import { type RelationCreationPayload } from 'twenty-shared/types';
import { useCreateOneFieldMetadataItem } from './useCreateOneFieldMetadataItem';
import { useDeleteOneFieldMetadataItem } from './useDeleteOneFieldMetadataItem';
import { useUpdateOneFieldMetadataItem } from './useUpdateOneFieldMetadataItem';

export const useFieldMetadataItem = () => {
  const { createOneFieldMetadataItem } = useCreateOneFieldMetadataItem();
  const { updateOneFieldMetadataItem } = useUpdateOneFieldMetadataItem();
  const { deleteOneFieldMetadataItem } = useDeleteOneFieldMetadataItem();

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
      relationCreationPayload?: RelationCreationPayload;
      morphRelationsCreationPayload?: RelationCreationPayload[];
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
      relationCreationPayload: input.relationCreationPayload,
      morphRelationsCreationPayload: input.morphRelationsCreationPayload,
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

  return {
    activateMetadataField,
    createMetadataField,
    deactivateMetadataField,
    deleteMetadataField: deleteOneFieldMetadataItem,
  };
};
