import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useCallback } from 'react';

export const useToggleRecordTableWidgetFieldVisibility = () => {
  const { performViewFieldAPIUpdate } = usePerformViewFieldAPIPersist();

  const toggleRecordTableWidgetFieldVisibility = useCallback(
    async (viewFieldId: string, isVisible: boolean) => {
      await performViewFieldAPIUpdate([
        {
          input: {
            id: viewFieldId,
            update: { isVisible },
          },
        },
      ]);
    },
    [performViewFieldAPIUpdate],
  );

  return { toggleRecordTableWidgetFieldVisibility };
};
