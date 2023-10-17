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
    const createdMetadataObject = await createOneMetadataObject({
      labelPlural: 'Suppliers',
      labelSingular: 'Supplier',
      nameSingular: 'supplier',
      namePlural: 'suppliers',
      description: 'Suppliers',
      icon: 'IconBuilding',
    });

    const supplierObjectId =
      createdMetadataObject.data?.createOneObject?.id ?? '';

    const { data: createNameFieldData } = await createOneMetadataField({
      objectId: supplierObjectId,
      labelSingular: 'Name',
      nameSingular: 'name',
      type: 'text',
      description: 'Name',
      labelPlural: 'Names',
      namePlural: 'names',
      icon: 'IconBuilding',
    });

    const nameFieldId = createNameFieldData?.createOneField.id ?? '';

    const { data: createCityFieldData } = await createOneMetadataField({
      objectId: supplierObjectId,
      labelSingular: 'City',
      nameSingular: 'city',
      type: 'text',
      description: 'City',
      labelPlural: 'Cities',
      namePlural: 'cities',
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
        labelSingular: 'City 2',
      },
    });

    await updateOneMetadataField({
      objectIdToUpdate: supplierObjectId,
      fieldIdToUpdate: nameFieldId,
      updatePayload: {
        labelSingular: 'Name 2',
      },
    });
  };
};
