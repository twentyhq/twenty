import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { hasInitializedAnyFieldFilterComponentFamilyState } from '@/views/states/hasInitializedAnyFieldFilterComponentFamilyState';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const ViewBarAnyFieldFilterEffect = () => {
  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const currentView = useRecoilValue(
    prefetchViewFromViewIdFamilySelector({
      viewId: currentViewId ?? '',
    }),
  );

  const [hasInitializedAnyFieldFilter, setHasInitializedAnyFieldFilter] =
    useRecoilComponentFamilyStateV2(
      hasInitializedAnyFieldFilterComponentFamilyState,
      {
        viewId: currentViewId ?? undefined,
      },
    );

  const setAnyFieldFilterValue = useSetRecoilComponentStateV2(
    anyFieldFilterValueComponentState,
  );

  useEffect(() => {
    if (!hasInitializedAnyFieldFilter && isDefined(currentView)) {
      if (currentView.objectMetadataId !== objectMetadataItem.id) {
        return;
      }

      setAnyFieldFilterValue(currentView.anyFieldFilterValue ?? '');

      setHasInitializedAnyFieldFilter(true);
    }
  }, [
    setAnyFieldFilterValue,
    currentViewId,
    hasInitializedAnyFieldFilter,
    setHasInitializedAnyFieldFilter,
    currentView,
    objectMetadataItem,
  ]);

  return null;
};
