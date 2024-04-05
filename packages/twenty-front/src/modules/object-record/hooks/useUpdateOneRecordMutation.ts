import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { useGenerateUpdateOneRecordMutation } from '@/object-record/hooks/useGenerateUpdateOneRecordMutation';

export const useUpdateOneRecordMutation = ({
  objectNameSingular,
  computeReferences = false,
}: {
  objectNameSingular: string;
  computeReferences?: boolean;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemOnly({
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
