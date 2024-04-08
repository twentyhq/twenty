import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { OrderBy } from '@/object-metadata/types/OrderBy';
import { OrderByField } from '@/object-metadata/types/OrderByField';
import { getOrderByFieldForObjectMetadataItem } from '@/object-metadata/utils/getObjectOrderByField';

export const useGetObjectOrderByField = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const getObjectOrderByField = (orderBy: OrderBy): OrderByField => {
    return getOrderByFieldForObjectMetadataItem(objectMetadataItem, orderBy);
  };

  return { getObjectOrderByField };
};
