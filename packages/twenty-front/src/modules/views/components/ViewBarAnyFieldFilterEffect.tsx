import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { hasInitializedAnyFieldFilterComponentFamilyState } from '@/views/states/hasInitializedAnyFieldFilterComponentFamilyState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const ViewBarAnyFieldFilterEffect = () => {
  const currentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const { objectMetadataItem, recordIndexId } = useRecordIndexContextOrThrow();

  const currentView = useAtomFamilySelectorValue(
    coreViewFromViewIdFamilySelector,
    {
      viewId: currentViewId ?? '',
    },
  );

  const [hasInitializedAnyFieldFilter, setHasInitializedAnyFieldFilter] =
    useAtomComponentFamilyState(
      hasInitializedAnyFieldFilterComponentFamilyState,
      {
        viewId: currentViewId ?? undefined,
      },
    );

  const setAnyFieldFilterValue = useSetAtomComponentState(
    anyFieldFilterValueComponentState,
    recordIndexId,
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
