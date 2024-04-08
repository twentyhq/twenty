import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
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
  const { objectMetadataItem } = useObjectMetadataItemOnly({
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
