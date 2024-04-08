import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGenerateFindOneRecordQuery } from '@/object-record/hooks/useGenerateFindOneRecordQuery';

export const useFindOneRecordQuery = ({
  objectNameSingular,
  depth,
}: {
  objectNameSingular: string;
  depth?: number;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const generateFindOneRecordQuery = useGenerateFindOneRecordQuery();

  const findOneRecordQuery = generateFindOneRecordQuery({
    objectMetadataItem,
    depth,
  });

  return {
    findOneRecordQuery,
  };
};
