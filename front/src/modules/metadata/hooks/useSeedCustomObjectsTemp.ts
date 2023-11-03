import { isNonEmptyArray } from '~/utils/isNonEmptyArray';

import { useCreateOneMetadataField } from './useCreateOneMetadataField';
import { useCreateOneObjectMetadataItem } from './useCreateOneObjectMetadataItem';

export const useSeedCustomObjectsTemp = () => {
  const { createOneObjectMetadataItem } = useCreateOneObjectMetadataItem();
  const { createOneMetadataField } = useCreateOneMetadataField();

  return async () => {
    const { data: createdObjectMetadataItem, errors } =
      await createOneObjectMetadataItem({
        labelPlural: 'Suppliers',
        labelSingular: 'Supplier',
        nameSingular: 'supplier',
        namePlural: 'suppliers',
        description: 'Suppliers',
        icon: 'IconBuilding',
      });

    if (!isNonEmptyArray(errors)) {
      const supplierObjectId =
        createdObjectMetadataItem?.createOneObject?.id ?? '';

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
    }
  };
};
