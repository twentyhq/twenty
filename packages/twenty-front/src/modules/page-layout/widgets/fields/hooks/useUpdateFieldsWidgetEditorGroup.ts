import { usePerformViewFieldGroupAPIPersist } from '@/views/hooks/internal/usePerformViewFieldGroupAPIPersist';
import { useCallback } from 'react';

type UpdateGroupParams = {
  groupId: string;
  name?: string;
  position?: number;
  isVisible?: boolean;
};

export const useUpdateFieldsWidgetEditorGroup = () => {
  const { performViewFieldGroupAPIUpdate } =
    usePerformViewFieldGroupAPIPersist();

  const updateGroup = useCallback(
    async ({ groupId, name, position, isVisible }: UpdateGroupParams) => {
      await performViewFieldGroupAPIUpdate([
        {
          input: {
            id: groupId,
            update: {
              name,
              position,
              isVisible,
            },
          },
        },
      ]);
    },
    [performViewFieldGroupAPIUpdate],
  );

  return { updateGroup };
};
