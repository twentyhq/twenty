import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGenerateCreateManyRecordMutation } from '@/object-record/hooks/useGenerateCreateManyRecordMutation';

export const useCreateManyRecordsMutation = ({
  objectNameSingular,
  queryFields,
  depth,
}: {
  objectNameSingular: string;
  queryFields?: Record<string, any>;
  depth?: number;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const createManyRecordsMutation = useGenerateCreateManyRecordMutation({
    objectMetadataItem,
    depth,
    queryFields,
  });

  return {
    createManyRecordsMutation,
  };
};
