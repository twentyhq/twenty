import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGenerateFindDuplicateRecordsQuery } from '@/object-record/hooks/useGenerateFindDuplicateRecordsQuery';

export const useFindDuplicateRecordsQuery = ({
  objectNameSingular,
  depth,
}: {
  objectNameSingular: string;
  depth?: number;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const generateFindDuplicateRecordsQuery =
    useGenerateFindDuplicateRecordsQuery();

  const findDuplicateRecordsQuery = generateFindDuplicateRecordsQuery({
    objectMetadataItem,
    depth,
  });

  return {
    findDuplicateRecordsQuery,
  };
};
