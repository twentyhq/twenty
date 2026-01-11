import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';

export const useDeleteComment = () => {
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Comment,
  });

  return {
    deleteComment: deleteOneRecord,
  };
};
