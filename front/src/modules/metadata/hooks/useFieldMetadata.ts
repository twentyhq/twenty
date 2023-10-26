import { ObjectFieldDataType } from '@/settings/data-model/types/ObjectFieldDataType';
import { Field } from '~/generated/graphql';

import { formatMetadataFieldInput } from '../utils/formatMetadataFieldInput';

import { useCreateOneMetadataField } from './useCreateOneMetadataField';
import { useDeleteOneMetadataField } from './useDeleteOneMetadataField';
import { useUpdateOneMetadataField } from './useUpdateOneMetadataField';

export const useFieldMetadata = () => {
  const { createOneMetadataField } = useCreateOneMetadataField();
  const { updateOneMetadataField } = useUpdateOneMetadataField();
  const { deleteOneMetadataField } = useDeleteOneMetadataField();

  const createField = (
    input: Pick<Field, 'label' | 'icon' | 'description'> & {
      objectId: string;
      type: ObjectFieldDataType;
    },
  ) =>
    createOneMetadataField({
      ...formatMetadataFieldInput(input),
      objectId: input.objectId,
    });

  const activateField = (metadataField: Field) =>
    updateOneMetadataField({
      fieldIdToUpdate: metadataField.id,
      updatePayload: { isActive: true },
    });

  const disableField = (metadataField: Field) =>
    updateOneMetadataField({
      fieldIdToUpdate: metadataField.id,
      updatePayload: { isActive: false },
    });

  const eraseField = (metadataField: Field) =>
    deleteOneMetadataField(metadataField.id);

  return {
    activateField,
    createField,
    disableField,
    eraseField,
  };
};
