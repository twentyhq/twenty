import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { convertUpdateViewInputToCore } from '@/views/utils/convertUpdateViewInputToCore';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useUpdateCoreViewMutation } from '~/generated/graphql';
import { useRefreshCoreViews } from './useRefreshCoreViews';

export const useUpdateView = () => {
  const [updateOneCoreView] = useUpdateCoreViewMutation();

  const { refreshCoreViews } = useRefreshCoreViews();

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const updateView = useRecoilCallback(
    () => async (view: Partial<GraphQLView>) => {
      if (!isDefined(view.id)) {
        return;
      }

      await updateOneCoreView({
        variables: {
          id: view.id,
          input: convertUpdateViewInputToCore(view),
        },
      });

      await refreshCoreViews(objectMetadataItem.id);
    },
    [objectMetadataItem.id, refreshCoreViews, updateOneCoreView],
  );

  return {
    updateView,
  };
};
