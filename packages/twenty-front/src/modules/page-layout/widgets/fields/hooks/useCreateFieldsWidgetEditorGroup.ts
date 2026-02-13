import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { usePerformViewFieldGroupAPIPersist } from '@/views/hooks/internal/usePerformViewFieldGroupAPIPersist';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

type UseCreateFieldsWidgetEditorGroupParams = {
  viewId: string | null;
  groups: FieldsWidgetGroup[];
};

export const useCreateFieldsWidgetEditorGroup = ({
  viewId,
  groups,
}: UseCreateFieldsWidgetEditorGroupParams) => {
  const { performViewFieldGroupAPICreate } =
    usePerformViewFieldGroupAPIPersist();

  const createGroup = useCallback(
    async (name: string) => {
      if (!isDefined(viewId)) {
        return;
      }

      const maxPosition = Math.max(...groups.map((g) => g.position), -1);
      const newId = v4();

      await performViewFieldGroupAPICreate({
        inputs: [
          {
            id: newId,
            name,
            position: maxPosition + 1,
            isVisible: true,
            viewId,
          },
        ],
      });

      return newId;
    },
    [viewId, groups, performViewFieldGroupAPICreate],
  );

  return { createGroup };
};
