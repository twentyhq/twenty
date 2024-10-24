import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { GraphQLView } from '@/views/types/GraphQLView';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useUpdateView = () => {
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const updateView = useRecoilCallback(
    () => async (view: Partial<GraphQLView>) => {
      if (isDefined(view.id)) {
        await updateOneRecord({
          idToUpdate: view.id,
          updateOneRecordInput: view,
        });
      }
    },
    [updateOneRecord],
  );

  return {
    updateView,
  };
};
