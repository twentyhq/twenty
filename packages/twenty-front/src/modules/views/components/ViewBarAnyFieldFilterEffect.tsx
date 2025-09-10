import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { hasInitializedAnyFieldFilterComponentFamilyState } from '@/views/states/hasInitializedAnyFieldFilterComponentFamilyState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const ViewBarAnyFieldFilterEffect = () => {
  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const currentView = useRecoilValue(
    coreViewFromViewIdFamilySelector({
      viewId: currentViewId ?? '',
    }),
  );

  const [hasInitializedAnyFieldFilter, setHasInitializedAnyFieldFilter] =
    useRecoilComponentFamilyState(
      hasInitializedAnyFieldFilterComponentFamilyState,
      {
        viewId: currentViewId ?? undefined,
      },
    );

  const setAnyFieldFilterValue = useSetRecoilComponentState(
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
