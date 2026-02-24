import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValue';
import { hasInitializedCurrentRecordSortsComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordSortsComponentFamilyState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const ViewBarRecordSortEffect = () => {
  const currentViewId = useAtomComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  const { objectMetadataItem, recordIndexId } = useRecordIndexContextOrThrow();

  const currentView = useFamilySelectorValue(coreViewFromViewIdFamilySelector, {
    viewId: currentViewId ?? '',
  });

  const [
    hasInitializedCurrentRecordSorts,
    setHasInitializedCurrentRecordSorts,
  ] = useAtomComponentFamilyState(
    hasInitializedCurrentRecordSortsComponentFamilyState,
    {
      viewId: currentViewId ?? undefined,
    },
  );

  const setCurrentRecordSorts = useSetAtomComponentState(
    currentRecordSortsComponentState,
    recordIndexId,
  );

  useEffect(() => {
    if (isDefined(currentView) && !hasInitializedCurrentRecordSorts) {
      if (currentView.objectMetadataId !== objectMetadataItem.id) {
        return;
      }

      if (isDefined(currentView)) {
        setCurrentRecordSorts(currentView.viewSorts);
        setHasInitializedCurrentRecordSorts(true);
      }
    }
  }, [
    hasInitializedCurrentRecordSorts,
    currentView,
    setCurrentRecordSorts,
    objectMetadataItem,
    setHasInitializedCurrentRecordSorts,
  ]);

  return null;
};
