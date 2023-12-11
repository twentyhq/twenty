import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { OrderBy } from '@/object-metadata/types/OrderBy';
import { OrderByField } from '@/object-metadata/types/OrderByField';
import { getObjectOrderByField } from '@/object-metadata/utils/getObjectOrderByField';

export const useGetObjectOrderByField = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  return (orderBy: OrderBy): OrderByField => {
    return getObjectOrderByField(objectMetadataItem, orderBy);
  };
};
