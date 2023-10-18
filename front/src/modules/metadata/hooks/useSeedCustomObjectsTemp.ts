import { useCreateOneMetadataField } from './useCreateOneMetadataField';
import { useCreateOneMetadataObject } from './useCreateOneMetadataObject';

export const useSeedCustomObjectsTemp = () => {
  const { createOneMetadataObject } = useCreateOneMetadataObject();
  const { createOneMetadataField } = useCreateOneMetadataField();

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

    await createOneMetadataField({
      objectId: supplierObjectId,
      name: 'name',
      type: 'text',
      description: 'Name',
      label: 'Name',
      icon: 'IconBuilding',
    });

    await createOneMetadataField({
      objectId: supplierObjectId,
      label: 'City',
      name: 'city',
      type: 'text',
      description: 'City',
      icon: 'IconMap',
    });
  };
};
