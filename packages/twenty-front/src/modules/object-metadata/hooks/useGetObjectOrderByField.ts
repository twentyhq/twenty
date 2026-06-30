import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';

import { getOrderByFieldForObjectMetadataItem } from '@/object-metadata/utils/getObjectOrderByField';
import {
  type OrderBy,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';

export const useGetObjectOrderByField = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const getObjectOrderByField = (
    orderBy: OrderBy,
  ): RecordGqlOperationOrderBy => {
    return getOrderByFieldForObjectMetadataItem(objectMetadataItem, orderBy);
  };

  return { getObjectOrderByField };
};
