import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { useGenerateFindOneRecordQuery } from '@/object-record/hooks/useGenerateFindOneRecordQuery';

export const useFindOneRecordQuery = ({
  objectNameSingular,
  depth,
}: {
  objectNameSingular: string;
  depth?: number;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemOnly({
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
