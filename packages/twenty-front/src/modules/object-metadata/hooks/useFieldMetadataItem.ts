import { Field, RelationType } from '~/generated-metadata/graphql';

import { FieldMetadataItem } from '../types/FieldMetadataItem';
import { formatFieldMetadataItemInput } from '../utils/formatFieldMetadataItemInput';

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
      relationCreationPayload?: {
        type: RelationType;
        targetObjectMetadataId: string;
        targetFieldLabel: string;
        targetFieldIcon: string;
      };
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
    return deleteOneFieldMetadataItem(metadataField.id);
  };

  return {
    activateMetadataField,
    createMetadataField,
    deactivateMetadataField,
    deleteMetadataField,
  };
};
