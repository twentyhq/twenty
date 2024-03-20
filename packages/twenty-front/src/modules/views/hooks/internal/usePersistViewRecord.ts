import { useRecoilCallback } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { GraphQLView } from '@/views/types/GraphQLView';
import { isDefined } from '~/utils/isDefined';

export const usePersistViewRecord = () => {
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const createViewRecord = useRecoilCallback(
    () => async (_view: GraphQLView) => {
      return;
    },
    [],
  );

  const updateViewRecord = useRecoilCallback(
    () => async (view: Partial<GraphQLView>) => {
      if (!view.id) {
        throw new Error('View ID is required to update a view.');
      }

      await updateOneRecord({
        idToUpdate: view.id,
        updateOneRecordInput: {
          ...(isDefined(view.name) && { name: view.name }),
          ...(isDefined(view.isCompact) && { isCompact: view.isCompact }),
          ...(isDefined(view.viewSorts) && { viewSorts: view.viewSorts }),
          ...(isDefined(view.viewFilters) && { viewFilters: view.viewFilters }),
        },
      });
    },
    [updateOneRecord],
  );

  return {
    createViewRecord,
    updateViewRecord,
  };
};
