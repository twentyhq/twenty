import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGenerateFindManyRecordsQuery } from '@/object-record/hooks/useGenerateFindManyRecordsQuery';
import { QueryFields } from '@/object-record/query-keys/types/QueryFields';

export const useFindManyRecordsQuery = ({
  objectNameSingular,
  queryFields,
}: {
  objectNameSingular: string;
  queryFields?: QueryFields;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const generateFindManyRecordsQuery = useGenerateFindManyRecordsQuery();

  const findManyRecordsQuery = generateFindManyRecordsQuery({
    objectMetadataItem,
    queryFields,
  });

  return {
    findManyRecordsQuery,
  };
};
