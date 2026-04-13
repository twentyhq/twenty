import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { removeWidgetFromTab } from '@/page-layout/utils/removeWidgetFromTab';
import { removeWidgetLayoutFromTab } from '@/page-layout/utils/removeWidgetLayoutFromTab';
import { useDeleteViewForFieldsWidget } from '@/page-layout/widgets/fields/hooks/useDeleteViewForFieldsWidget';
import { useDeleteViewForRecordTableWidget } from '@/page-layout/widgets/record-table/hooks/useDeleteViewForRecordTableWidget';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

export const useRemovePageLayoutWidgetAndPreservePosition = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsState = useAtomComponentStateCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const pageLayoutDraggedAreaState = useAtomComponentStateCallbackState(
    pageLayoutDraggedAreaComponentState,
    pageLayoutId,
  );

  const pageLayoutEditingWidgetIdState = useAtomComponentStateCallbackState(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const { deleteViewForFieldsWidget } = useDeleteViewForFieldsWidget();

  const { deleteViewForRecordTableWidget } =
    useDeleteViewForRecordTableWidget();

  const pageLayoutPersistedState = useAtomComponentStateCallbackState(
    pageLayoutPersistedComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const removePageLayoutWidgetAndPreservePosition = useCallback(
    (widgetId: string) => {
      const pageLayoutDraft = store.get(pageLayoutDraftState);
      const allTabLayouts = store.get(pageLayoutCurrentLayoutsState);

      const tabWithWidget = pageLayoutDraft.tabs.find((tab) =>
        tab.widgets.some((widget) => widget.id === widgetId),
      );

      const widgetToRemove = tabWithWidget?.widgets.find(
        (widget) => widget.id === widgetId,
      );

      const persisted = store.get(pageLayoutPersistedState);
      const persistedWidgetIds = new Set(
        persisted?.tabs.flatMap((tab) =>
          tab.widgets.map((widget) => widget.id),
        ) ?? [],
      );

      const isWidgetPersisted = persistedWidgetIds.has(widgetId);

      if (isWidgetPersisted && isDefined(widgetToRemove)) {
        const viewId = getWidgetConfigurationViewId(
          widgetToRemove.configuration,
        );

        if (isDefined(viewId)) {
          if (widgetToRemove.type === WidgetType.RECORD_TABLE) {
            deleteViewForRecordTableWidget(viewId);
          }

          if (widgetToRemove.type === WidgetType.FIELDS) {
            deleteViewForFieldsWidget(viewId);
          }
        }
      }

      const tabId = tabWithWidget?.id;

      if (!isDefined(tabId)) {
        return;
      }

      const tabLayouts = allTabLayouts[tabId];
      const widgetLayout = tabLayouts?.desktop?.find(
        (layout) => layout.i === widgetId,
      );

      if (!isDefined(widgetLayout)) {
        return;
      }

      store.set(pageLayoutDraggedAreaState, {
        x: widgetLayout.x,
        y: widgetLayout.y,
        w: widgetLayout.w,
        h: widgetLayout.h,
      });

      const updatedLayouts = removeWidgetLayoutFromTab(
        allTabLayouts,
        tabId,
        widgetId,
      );
      store.set(pageLayoutCurrentLayoutsState, updatedLayouts);

      store.set(pageLayoutDraftState, (prev) => ({
        ...prev,
        tabs: removeWidgetFromTab(prev.tabs, tabId, widgetId),
      }));

      store.set(pageLayoutEditingWidgetIdState, null);
    },
    [
      deleteViewForFieldsWidget,
      deleteViewForRecordTableWidget,
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      pageLayoutDraggedAreaState,
      pageLayoutEditingWidgetIdState,
      pageLayoutPersistedState,
      store,
    ],
  );

  return { removePageLayoutWidgetAndPreservePosition };
};
