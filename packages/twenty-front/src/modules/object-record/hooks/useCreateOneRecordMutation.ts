import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { useGenerateCreateOneRecordMutation } from '@/object-record/hooks/useGenerateCreateOneRecordMutation';

export const useCreateOneRecordMutation = ({
  objectNameSingular,
  queryFields,
}: {
  objectNameSingular: string;
  queryFields?: Record<string, any>;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemOnly({
    objectNameSingular,
  });

  const createOneRecordMutation = useGenerateCreateOneRecordMutation({
    objectMetadataItem,
    queryFields,
  });

  return {
    createOneRecordMutation,
  };
};
