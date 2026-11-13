import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { recordIndexViewTabsComponentState } from '@/object-record/record-index-tab/states/recordIndexViewTabsComponentState';
import { type RecordIndexTab } from '@/object-record/record-index-tab/types/RecordIndexTab';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { usePerformViewFilterApiPersist } from '@/views/hooks/internal/usePerformViewFilterApiPersist';
import { usePerformViewTabApiPersist } from '@/views/hooks/internal/usePerformViewTabApiPersist';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { type View } from '@/views/types/View';
import { type ViewTab } from '@/views/types/ViewTab';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ViewTabType } from '~/generated-metadata/graphql';

type RecordIndexTabUpdate = Partial<Pick<ViewTab, 'isVisible' | 'position'>>;

const VIEW_TAB_TYPE_BY_RECORD_INDEX_TAB_KIND = {
  option: ViewTabType.FIELD_VALUE,
  noValue: ViewTabType.NO_VALUE,
  all: ViewTabType.ALL,
  custom: ViewTabType.CUSTOM,
} as const satisfies Record<RecordIndexTab['kind'], ViewTabType>;

export const usePersistRecordIndexViewTabs = () => {
  const store = useStore();

  const currentViewIdAtom = useAtomComponentStateCallbackState(
    contextStoreCurrentViewIdComponentState,
  );

  const recordIndexViewTabsAtom = useAtomComponentStateCallbackState(
    recordIndexViewTabsComponentState,
  );

  const {
    performViewTabApiCreate,
    performViewTabApiUpdate,
    performViewTabApiDestroy,
  } = usePerformViewTabApiPersist();

  const { performViewFilterApiDestroy } = usePerformViewFilterApiPersist();

  const getCurrentView = useCallback(
    (): View | undefined =>
      store.get(
        viewFromViewIdFamilySelector.selectorFamily({
          viewId: store.get(currentViewIdAtom) ?? '',
        }),
      ),
    [currentViewIdAtom, store],
  );

  // Record index states only load when the view changes, so tab writes refresh them from the store
  const syncRecordIndexViewTabs = useCallback(() => {
    store.set(recordIndexViewTabsAtom, getCurrentView()?.viewTabs ?? []);
  }, [getCurrentView, recordIndexViewTabsAtom, store]);

  const writeRecordIndexTab = useCallback(
    async (recordIndexTab: RecordIndexTab, update: RecordIndexTabUpdate) => {
      if (isDefined(recordIndexTab.viewTabId)) {
        return performViewTabApiUpdate({
          id: recordIndexTab.viewTabId,
          update,
        });
      }

      const currentView = getCurrentView();

      if (!isDefined(currentView)) {
        return;
      }

      return performViewTabApiCreate({
        viewId: currentView.id,
        type: VIEW_TAB_TYPE_BY_RECORD_INDEX_TAB_KIND[recordIndexTab.kind],
        fieldValue:
          recordIndexTab.kind === 'option' ? recordIndexTab.id : undefined,
        position: update.position ?? recordIndexTab.position,
        isVisible: update.isVisible ?? recordIndexTab.isVisible,
      });
    },
    [getCurrentView, performViewTabApiCreate, performViewTabApiUpdate],
  );

  const updateRecordIndexTab = useCallback(
    async (recordIndexTab: RecordIndexTab, update: RecordIndexTabUpdate) => {
      await writeRecordIndexTab(recordIndexTab, update);
      syncRecordIndexViewTabs();
    },
    [syncRecordIndexViewTabs, writeRecordIndexTab],
  );

  const reorderRecordIndexTabs = useCallback(
    async (orderedRecordIndexTabs: RecordIndexTab[]) => {
      await Promise.all(
        orderedRecordIndexTabs.map((recordIndexTab, index) =>
          recordIndexTab.position === index
            ? undefined
            : writeRecordIndexTab(recordIndexTab, { position: index }),
        ),
      );
      syncRecordIndexViewTabs();
    },
    [syncRecordIndexViewTabs, writeRecordIndexTab],
  );

  const ensureAllViewTab = useCallback(async () => {
    const currentView = getCurrentView();

    if (
      !isDefined(currentView) ||
      (currentView.viewTabs ?? []).some(({ type }) => type === ViewTabType.ALL)
    ) {
      return;
    }

    // All stays after the custom tabs created later until the tabs are reordered
    await performViewTabApiCreate({
      viewId: currentView.id,
      type: ViewTabType.ALL,
      position: Number.MAX_SAFE_INTEGER,
      isVisible: true,
    });
    syncRecordIndexViewTabs();
  }, [getCurrentView, performViewTabApiCreate, syncRecordIndexViewTabs]);

  const destroyViewTabs = useCallback(
    async (viewTabs: ViewTab[]) => {
      // The database cascade from a tab to its filters would leave them in the metadata store
      await performViewFilterApiDestroy(
        viewTabs.flatMap(({ viewFilters = [] }) =>
          viewFilters.map(({ id }) => ({ input: { id } })),
        ),
      );

      await Promise.all(viewTabs.map(({ id }) => performViewTabApiDestroy(id)));
      syncRecordIndexViewTabs();
    },
    [
      performViewFilterApiDestroy,
      performViewTabApiDestroy,
      syncRecordIndexViewTabs,
    ],
  );

  const destroyAllViewTabs = useCallback(
    () => destroyViewTabs(getCurrentView()?.viewTabs ?? []),
    [destroyViewTabs, getCurrentView],
  );

  return {
    getCurrentView,
    syncRecordIndexViewTabs,
    updateRecordIndexTab,
    reorderRecordIndexTabs,
    ensureAllViewTab,
    destroyViewTabs,
    destroyAllViewTabs,
  };
};
