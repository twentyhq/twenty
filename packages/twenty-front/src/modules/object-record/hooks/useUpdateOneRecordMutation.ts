import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGenerateUpdateOneRecordMutation } from '@/object-record/hooks/useGenerateUpdateOneRecordMutation';

export const useUpdateOneRecordMutation = ({
  objectNameSingular,
  computeReferences = false,
}: {
  objectNameSingular: string;
  computeReferences?: boolean;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const updateOneRecordMutation = useGenerateUpdateOneRecordMutation({
    objectMetadataItem,
    computeReferences,
  });

  return {
    updateOneRecordMutation,
  };
};
