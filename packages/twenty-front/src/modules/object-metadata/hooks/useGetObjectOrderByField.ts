import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';

import { getOrderByFieldForObjectMetadataItem } from '@/object-metadata/utils/getObjectOrderByField';
import { type RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { type OrderBy } from '@/types/OrderBy';

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
