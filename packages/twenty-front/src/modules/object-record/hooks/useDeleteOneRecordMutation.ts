import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { generateDeleteOneRecordMutation } from '@/object-record/utils/generateDeleteOneRecordMutation';

export const useDeleteOneRecordMutation = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemOnly({
    objectNameSingular,
  });

  const deleteOneRecordMutation = generateDeleteOneRecordMutation({
    objectMetadataItem,
  });

  return {
    deleteOneRecordMutation,
  };
};
