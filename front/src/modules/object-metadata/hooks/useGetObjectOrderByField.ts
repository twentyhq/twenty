import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { OrderByField } from '@/object-metadata/types/OrderByField';
import { getObjectOrderByField } from '@/object-metadata/utils/getObjectOrderByField';
import { OrderBy } from '@/object-record/select/hooks/useRecordsForSelect';

export const useGetObjectOrderByField = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  return (orderBy: OrderBy): OrderByField => {
    return getObjectOrderByField(objectMetadataItem, orderBy);
  };
};
