import { Field } from '~/generated/graphql';

import { useDeleteOneMetadataField } from './useDeleteOneMetadataField';
import { useUpdateOneMetadataField } from './useUpdateOneMetadataField';

export const useFieldMetadata = () => {
  const { updateOneMetadataField } = useUpdateOneMetadataField();
  const { deleteOneMetadataField } = useDeleteOneMetadataField();

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
    disableField,
    eraseField,
  };
};
