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
      labelSingular: 'Name',
      nameSingular: 'name',
      type: 'text',
      description: 'Name',
      labelPlural: 'Names',
      namePlural: 'names',
      placeholder: 'Name',
      icon: 'IconBuilding',
    });

    await createOneMetadataField({
      objectId: supplierObjectId,
      labelSingular: 'City',
      nameSingular: 'city',
      type: 'text',
      description: 'City',
      labelPlural: 'Cities',
      namePlural: 'cities',
      placeholder: 'City',
      icon: 'IconMap',
    });
  };
};
