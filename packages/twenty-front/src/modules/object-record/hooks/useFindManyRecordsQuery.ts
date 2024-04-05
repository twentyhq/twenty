import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { useGenerateFindManyRecordsQuery } from '@/object-record/hooks/useGenerateFindManyRecordsQuery';
import { QueryFields } from '@/object-record/query-keys/types/QueryFields';

export const useFindManyRecordsQuery = ({
  objectNameSingular,
  queryFields,
}: {
  objectNameSingular: string;
  queryFields?: QueryFields;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemOnly({
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
