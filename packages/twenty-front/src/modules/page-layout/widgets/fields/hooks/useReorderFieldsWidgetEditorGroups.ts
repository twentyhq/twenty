import { usePerformViewFieldGroupAPIPersist } from '@/views/hooks/internal/usePerformViewFieldGroupAPIPersist';
import { useCallback } from 'react';

export const useReorderFieldsWidgetEditorGroups = () => {
  const { performViewFieldGroupAPIUpdate } =
    usePerformViewFieldGroupAPIPersist();

  const reorderGroups = useCallback(
    async (reorderedGroupIds: string[]) => {
      const updates = reorderedGroupIds.map((groupId, index) => ({
        input: {
          id: groupId,
          update: {
            position: index,
          },
        },
      }));

      await performViewFieldGroupAPIUpdate(updates);
    },
    [performViewFieldGroupAPIUpdate],
  );

  return { reorderGroups };
};
