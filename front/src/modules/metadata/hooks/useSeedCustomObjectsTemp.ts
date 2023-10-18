import { isNonEmptyArray } from '~/utils/isNonEmptyArray';

import { useCreateOneMetadataField } from './useCreateOneMetadataField';
import { useCreateOneMetadataObject } from './useCreateOneMetadataObject';
import { useUpdateOneMetadataField } from './useUpdateOneMetadataField';
import { useUpdateOneMetadataObject } from './useUpdateOneMetadataObject';

export const useSeedCustomObjectsTemp = () => {
  const { createOneMetadataObject } = useCreateOneMetadataObject();
  const { createOneMetadataField } = useCreateOneMetadataField();

  const { updateOneMetadataObject } = useUpdateOneMetadataObject();
  const { updateOneMetadataField } = useUpdateOneMetadataField();

  return async () => {
    const { data: createdMetadataObject, errors } =
      await createOneMetadataObject({
        labelPlural: 'Suppliers',
        labelSingular: 'Supplier',
        nameSingular: 'supplier',
        namePlural: 'suppliers',
        description: 'Suppliers',
        icon: 'IconBuilding',
      });

    if (!isNonEmptyArray(errors)) {
      const supplierObjectId = createdMetadataObject?.createOneObject?.id ?? '';

      const { data: createNameFieldData } = await createOneMetadataField({
        objectId: supplierObjectId,
        name: 'name',
        type: 'text',
        description: 'Name',
        label: 'Name',
        icon: 'IconBuilding',
      });

      const nameFieldId = createNameFieldData?.createOneField.id ?? '';

      const { data: createCityFieldData } = await createOneMetadataField({
        objectId: supplierObjectId,
        label: 'City',
        name: 'city',
        type: 'text',
        description: 'City',
        icon: 'IconMap',
      });

      const cityFieldId = createCityFieldData?.createOneField.id ?? '';

      await updateOneMetadataObject({
        idToUpdate: supplierObjectId,
        updatePayload: {
          labelPlural: 'Suppliers 2',
        },
      });

      await updateOneMetadataField({
        objectIdToUpdate: supplierObjectId,
        fieldIdToUpdate: cityFieldId,
        updatePayload: {
          label: 'City 2',
        },
      });

      await updateOneMetadataField({
        objectIdToUpdate: supplierObjectId,
        fieldIdToUpdate: nameFieldId,
        updatePayload: {
          label: 'Name 2',
        },
      });
    }
  };
};
