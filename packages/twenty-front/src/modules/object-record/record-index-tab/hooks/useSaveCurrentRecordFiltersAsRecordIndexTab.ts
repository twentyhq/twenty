import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { usePersistRecordIndexViewTabs } from '@/object-record/record-index-tab/hooks/usePersistRecordIndexViewTabs';
import { useSelectRecordIndexTab } from '@/object-record/record-index-tab/hooks/useSelectRecordIndexTab';
import { getAdHocViewFiltersForRecordIndexTab } from '@/object-record/record-index-tab/utils/getAdHocViewFiltersForRecordIndexTab';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useApplyCurrentViewFiltersToCurrentRecordFilters } from '@/views/hooks/useApplyCurrentViewFiltersToCurrentRecordFilters';
import { type ViewTab } from '@/views/types/ViewTab';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useSaveCurrentRecordFiltersAsRecordIndexTab = () => {
  const store = useStore();

  const currentRecordFiltersAtom = useAtomComponentStateCallbackState(
    currentRecordFiltersComponentState,
  );

  const { getCurrentView, createCustomViewTab, replaceViewTabFilters } =
    usePersistRecordIndexViewTabs();

  const { selectRecordIndexTab } = useSelectRecordIndexTab();

  const { applyCurrentViewFiltersToCurrentRecordFilters } =
    useApplyCurrentViewFiltersToCurrentRecordFilters();

  const getAdHocViewFilters = () =>
    getAdHocViewFiltersForRecordIndexTab({
      viewFilters: getCurrentView()?.viewFilters ?? [],
      recordFilters: store.get(currentRecordFiltersAtom),
    });

  const saveCurrentRecordFiltersAsNewRecordIndexTab = async (name: string) => {
    const viewTabId = await createCustomViewTab(name, getAdHocViewFilters());

    if (!isDefined(viewTabId)) {
      return;
    }

    applyCurrentViewFiltersToCurrentRecordFilters();
    selectRecordIndexTab(viewTabId);
  };

  const saveCurrentRecordFiltersToRecordIndexTab = async (viewTab: ViewTab) => {
    await replaceViewTabFilters(viewTab, getAdHocViewFilters());
    applyCurrentViewFiltersToCurrentRecordFilters();
  };

  return {
    saveCurrentRecordFiltersAsNewRecordIndexTab,
    saveCurrentRecordFiltersToRecordIndexTab,
  };
};
