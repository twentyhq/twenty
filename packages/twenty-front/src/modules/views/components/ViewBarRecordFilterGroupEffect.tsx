import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { hasInitializedCurrentRecordFilterGroupsComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFilterGroupsComponentFamilyState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const ViewBarRecordFilterGroupEffect = () => {
  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );

  const { objectMetadataItem, recordIndexId } = useRecordIndexContextOrThrow();

  const currentView = useFamilySelectorValueV2(
    coreViewFromViewIdFamilySelector,
    { viewId: currentViewId ?? '' },
  );

  const [
    hasInitializedCurrentRecordFilterGroups,
    setHasInitializedCurrentRecordFilterGroups,
  ] = useRecoilComponentFamilyStateV2(
    hasInitializedCurrentRecordFilterGroupsComponentFamilyState,
    {
      viewId: currentViewId ?? undefined,
    },
  );

  const setCurrentRecordFilterGroups = useSetRecoilComponentStateV2(
    currentRecordFilterGroupsComponentState,
    recordIndexId,
  );

  useEffect(() => {
    if (isDefined(currentView) && !hasInitializedCurrentRecordFilterGroups) {
      if (currentView.objectMetadataId !== objectMetadataItem.id) {
        return;
      }

      if (isDefined(currentView)) {
        setCurrentRecordFilterGroups(
          mapViewFilterGroupsToRecordFilterGroups(
            currentView.viewFilterGroups ?? [],
          ),
        );

        setHasInitializedCurrentRecordFilterGroups(true);
      }
    }
  }, [
    currentViewId,
    setCurrentRecordFilterGroups,
    hasInitializedCurrentRecordFilterGroups,
    setHasInitializedCurrentRecordFilterGroups,
    objectMetadataItem,
    currentView,
  ]);

  return null;
};
