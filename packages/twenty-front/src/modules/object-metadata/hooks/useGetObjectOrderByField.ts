import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { OrderBy } from '@/object-metadata/types/OrderBy';
import { getOrderByFieldForObjectMetadataItem } from '@/object-metadata/utils/getObjectOrderByField';
import { RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';

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
