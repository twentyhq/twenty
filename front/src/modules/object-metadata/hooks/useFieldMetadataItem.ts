import { MetadataFieldDataType } from '@/settings/data-model/types/ObjectFieldDataType';
import { Field } from '~/generated/graphql';

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
    input: Pick<Field, 'label' | 'icon' | 'description'> & {
      objectMetadataId: string;
      type: MetadataFieldDataType;
    },
  ) =>
    createOneFieldMetadataItem({
      ...formatFieldMetadataItemInput(input),
      objectMetadataId: input.objectMetadataId,
      type: input.type,
    });

  const editMetadataField = (
    input: Pick<Field, 'id' | 'label' | 'icon' | 'description'>,
  ) =>
    updateOneFieldMetadataItem({
      fieldMetadataIdToUpdate: input.id,
      updatePayload: formatFieldMetadataItemInput(input),
    });

  const activateMetadataField = (metadataField: FieldMetadataItem) =>
    updateOneFieldMetadataItem({
      fieldMetadataIdToUpdate: metadataField.id,
      updatePayload: { isActive: true },
    });

  const disableMetadataField = (metadataField: FieldMetadataItem) =>
    updateOneFieldMetadataItem({
      fieldMetadataIdToUpdate: metadataField.id,
      updatePayload: { isActive: false },
    });

  const eraseMetadataField = (metadataField: FieldMetadataItem) =>
    deleteOneFieldMetadataItem(metadataField.id);

  return {
    activateMetadataField,
    createMetadataField,
    disableMetadataField,
    eraseMetadataField,
    editMetadataField,
  };
};
