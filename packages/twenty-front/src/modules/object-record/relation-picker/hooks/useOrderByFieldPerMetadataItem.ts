import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectOrderByField } from '@/object-metadata/utils/getObjectOrderByField';
import { isNonNullable } from '~/utils/isNonNullable';
import { capitalize } from '~/utils/string/capitalize';

export const useOrderByFieldPerMetadataItem = ({
  objectMetadataItems,
}: {
  objectMetadataItems: ObjectMetadataItem[];
}) => {
  const orderByFieldPerMetadataItem = Object.fromEntries(
    objectMetadataItems
      .map((objectMetadataItem) => {
        const orderByField = getObjectOrderByField(objectMetadataItem);

        return [
          `orderBy${capitalize(objectMetadataItem.nameSingular)}`,
          {
            ...orderByField,
          },
        ];
      })
      .filter(isNonNullable),
  );

  return {
    orderByFieldPerMetadataItem,
  };
};
