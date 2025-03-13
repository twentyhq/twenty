import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { hasInitializedCurrentRecordSortsComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordSortsComponentFamilyState';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const ViewBarRecordSortEffect = () => {
  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );

  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  const currentView = useRecoilValue(
    prefetchViewFromViewIdFamilySelector({
      viewId: currentViewId ?? '',
    }),
  );

  const [
    hasInitializedCurrentRecordSorts,
    setHasInitializedCurrentRecordSorts,
  ] = useRecoilComponentFamilyStateV2(
    hasInitializedCurrentRecordSortsComponentFamilyState,
    {
      viewId: currentViewId ?? undefined,
    },
  );

  const setCurrentRecordSorts = useSetRecoilComponentStateV2(
    currentRecordSortsComponentState,
  );

  useEffect(() => {
    if (isDefined(currentView) && !hasInitializedCurrentRecordSorts) {
      if (
        currentView.objectMetadataId !== contextStoreCurrentObjectMetadataItemId
      ) {
        return;
      }

      if (isDefined(currentView)) {
        setCurrentRecordSorts(mapViewSortsToSorts(currentView.viewSorts));
        setHasInitializedCurrentRecordSorts(true);
      }
    }
  }, [
    hasInitializedCurrentRecordSorts,
    currentView,
    setCurrentRecordSorts,
    contextStoreCurrentObjectMetadataItemId,
    setHasInitializedCurrentRecordSorts,
  ]);

  return null;
};
