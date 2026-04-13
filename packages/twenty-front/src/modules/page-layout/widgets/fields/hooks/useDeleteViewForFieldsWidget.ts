import { usePerformViewAPIPersist } from '@/views/hooks/internal/usePerformViewAPIPersist';
import { useCallback } from 'react';

export const useDeleteViewForFieldsWidget = () => {
  const { performViewAPIDestroy } = usePerformViewAPIPersist();

  const deleteViewForFieldsWidget = useCallback(
    async (viewId: string) => {
      await performViewAPIDestroy({ id: viewId });
    },
    [performViewAPIDestroy],
  );

  return { deleteViewForFieldsWidget };
};
