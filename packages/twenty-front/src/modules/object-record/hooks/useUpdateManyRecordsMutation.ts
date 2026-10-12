import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { generateUpdateManyRecordsMutation } from '@/object-metadata/utils/generateUpdateManyRecordsMutation';
import { EMPTY_MUTATION } from '@/object-record/constants/EmptyMutation';
import { isDefined } from 'twenty-shared/utils';

export const useUpdateManyRecordsMutation = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  if (!isDefined(objectMetadataItem)) {
    return { updateManyRecordsMutation: EMPTY_MUTATION };
  }

  const updateManyRecordsMutation = generateUpdateManyRecordsMutation({
    objectMetadataItem,
  });

  return {
    updateManyRecordsMutation,
  };
};
