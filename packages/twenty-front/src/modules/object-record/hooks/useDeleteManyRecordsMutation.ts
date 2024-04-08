import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { useGenerateDeleteManyRecordMutation } from '@/object-record/hooks/useGenerateDeleteManyRecordMutation';

export const useDeleteManyRecordsMutation = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemOnly({
    objectNameSingular,
  });

  const deleteManyRecordsMutation = useGenerateDeleteManyRecordMutation({
    objectMetadataItem,
  });

  return {
    deleteManyRecordsMutation,
  };
};
