import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGenerateCreateOneRecordMutation } from '@/object-record/hooks/useGenerateCreateOneRecordMutation';

export const useCreateOneRecordMutation = ({
  objectNameSingular,
  queryFields,
}: {
  objectNameSingular: string;
  queryFields?: Record<string, any>;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
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
