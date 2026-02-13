import { usePerformViewFieldGroupAPIPersist } from '@/views/hooks/internal/usePerformViewFieldGroupAPIPersist';
import { useCallback } from 'react';

export const useDeleteFieldsWidgetEditorGroup = () => {
  const { performViewFieldGroupAPIDelete } =
    usePerformViewFieldGroupAPIPersist();

  const deleteGroup = useCallback(
    async (groupId: string) => {
      await performViewFieldGroupAPIDelete([{ input: { id: groupId } }]);
    },
    [performViewFieldGroupAPIDelete],
  );

  return { deleteGroup };
};
