import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { convertUpdateViewInputToCore } from '@/views/utils/convertUpdateViewInputToCore';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey, useUpdateCoreViewMutation } from '~/generated/graphql';
import { useRefreshCoreViews } from './useRefreshCoreViews';

export const useUpdateView = () => {
  const featureFlagMap = useFeatureFlagsMap();
  const isCoreViewEnabled = featureFlagMap[FeatureFlagKey.IS_CORE_VIEW_ENABLED];

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const [updateOneCoreView] = useUpdateCoreViewMutation();

  const { refreshCoreViews } = useRefreshCoreViews();

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const updateView = useRecoilCallback(
    () => async (view: Partial<GraphQLView>) => {
      if (!isDefined(view.id)) {
        return;
      }

      if (isCoreViewEnabled) {
        await updateOneCoreView({
          variables: {
            id: view.id,
            input: convertUpdateViewInputToCore(view),
          },
        });

        await refreshCoreViews(objectMetadataItem.id);
      } else {
        await updateOneRecord({
          idToUpdate: view.id,
          updateOneRecordInput: view,
        });
      }
    },
    [
      isCoreViewEnabled,
      objectMetadataItem.id,
      refreshCoreViews,
      updateOneCoreView,
      updateOneRecord,
    ],
  );

  return {
    updateView,
  };
};
