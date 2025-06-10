import { useRecoilCallback } from 'recoil';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { GraphQLView } from '@/views/types/GraphQLView';
import { isDefined } from 'twenty-shared/utils';

export const useUpdateCurrentView = () => {
  const currentViewIdCallbackState = useRecoilComponentCallbackStateV2(
    contextStoreCurrentViewIdComponentState,
  );

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const updateCurrentView = useRecoilCallback(
    ({ snapshot }) =>
      async (view: Partial<GraphQLView>) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdCallbackState)
          .getValue();

        if (isDefined(currentViewId)) {
          await updateOneRecord({
            idToUpdate: currentViewId,
            updateOneRecordInput: view,
          });
        }
      },
    [currentViewIdCallbackState, updateOneRecord],
  );

  return {
    updateCurrentView,
  };
};
