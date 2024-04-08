import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { generateDeleteOneRecordMutation } from '@/object-record/utils/generateDeleteOneRecordMutation';

export const useDeleteOneRecordMutation = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const deleteOneRecordMutation = generateDeleteOneRecordMutation({
    objectMetadataItem,
  });

  return {
    deleteOneRecordMutation,
  };
};
