import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGenerateDeleteManyRecordMutation } from '@/object-record/hooks/useGenerateDeleteManyRecordMutation';

export const useDeleteManyRecordsMutation = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const deleteManyRecordsMutation = useGenerateDeleteManyRecordMutation({
    objectMetadataItem,
  });

  return {
    deleteManyRecordsMutation,
  };
};
