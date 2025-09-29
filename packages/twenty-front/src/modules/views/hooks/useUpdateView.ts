import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { convertUpdateViewInputToCore } from '@/views/utils/convertUpdateViewInputToCore';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useUpdateCoreViewMutation } from '~/generated/graphql';

export const useUpdateView = () => {
  const [updateOneCoreView] = useUpdateCoreViewMutation();

  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

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

      await refreshCoreViewsByObjectMetadataId(objectMetadataItem.id);
    },
    [
      objectMetadataItem.id,
      refreshCoreViewsByObjectMetadataId,
      updateOneCoreView,
    ],
  );

  return {
    updateView,
  };
};
