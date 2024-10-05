import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useRecoilCallback } from 'recoil';

export const useDeleteView = () => {
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const deleteView = useRecoilCallback(
    () => async (viewId: string) => {
      await deleteOneRecord(viewId);
    },
    [deleteOneRecord],
  );

  return { deleteView };
};
