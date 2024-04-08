import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { useGenerateFindDuplicateRecordsQuery } from '@/object-record/hooks/useGenerateFindDuplicateRecordsQuery';

export const useFindDuplicateRecordsQuery = ({
  objectNameSingular,
  depth,
}: {
  objectNameSingular: string;
  depth?: number;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemOnly({
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
