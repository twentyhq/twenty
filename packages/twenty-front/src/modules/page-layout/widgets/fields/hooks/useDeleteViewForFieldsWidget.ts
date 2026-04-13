import { usePerformViewAPIPersist } from '@/views/hooks/internal/usePerformViewAPIPersist';
import { useGetViewFromState } from '@/views/hooks/useGetViewFromState';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useDeleteViewForFieldsWidget = () => {
  const { performViewAPIDestroy } = usePerformViewAPIPersist();
  const { getViewFromState } = useGetViewFromState();

  const deleteViewForFieldsWidget = useCallback(
    async (viewId: string) => {
      if (!isDefined(getViewFromState(viewId))) {
        return;
      }

      await performViewAPIDestroy({ id: viewId });
    },
    [performViewAPIDestroy, getViewFromState],
  );

  return { deleteViewForFieldsWidget };
};
