import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectOrderByField } from '@/object-metadata/utils/getObjectOrderByField';
import { isDefined } from '~/utils/isDefined';
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
      .filter(isDefined),
  );

  return {
    orderByFieldPerMetadataItem,
  };
};
