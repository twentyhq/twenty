import { usePerformViewAPIPersist } from '@/views/hooks/internal/usePerformViewAPIPersist';
import { useCallback } from 'react';

export const useDeleteViewForRecordTableWidget = () => {
  const { performViewAPIDestroy } = usePerformViewAPIPersist();

  const deleteViewForRecordTableWidget = useCallback(
    async (viewId: string) => {
      await performViewAPIDestroy({ id: viewId });
    },
    [performViewAPIDestroy],
  );

  return { deleteViewForRecordTableWidget };
};
