import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { removeWidgetFromTab } from '@/page-layout/utils/removeWidgetFromTab';
import { removeWidgetLayoutFromTab } from '@/page-layout/utils/removeWidgetLayoutFromTab';
import { useDeleteViewForFieldsWidget } from '@/page-layout/widgets/fields/hooks/useDeleteViewForFieldsWidget';
import { useDeleteViewForRecordTableWidget } from '@/page-layout/widgets/record-table/hooks/useDeleteViewForRecordTableWidget';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

export const useDeletePageLayoutWidget = (pageLayoutIdFromProps?: string) => {
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

  const pageLayoutEditingWidgetIdState = useAtomComponentStateCallbackState(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const { closeSidePanelMenu } = useSidePanelMenu();

  const { deleteViewForFieldsWidget } = useDeleteViewForFieldsWidget();

  const { deleteViewForRecordTableWidget } =
    useDeleteViewForRecordTableWidget();

  const store = useStore();

  const deletePageLayoutWidget = useCallback(
    (widgetId: string) => {
      closeSidePanelMenu();

      const pageLayoutDraft = store.get(pageLayoutDraftState);
      const allTabLayouts = store.get(pageLayoutCurrentLayoutsState);

      const tabWithWidget = pageLayoutDraft.tabs.find((tab) =>
        tab.widgets.some((widget) => widget.id === widgetId),
      );

      const widgetToDelete = tabWithWidget?.widgets.find(
        (widget) => widget.id === widgetId,
      );

      if (
        isDefined(widgetToDelete) &&
        widgetToDelete.type === WidgetType.RECORD_TABLE &&
        'viewId' in widgetToDelete.configuration &&
        isDefined(widgetToDelete.configuration.viewId)
      ) {
        deleteViewForRecordTableWidget(
          widgetToDelete.configuration.viewId as string,
        );
      }

      if (
        isDefined(widgetToDelete) &&
        widgetToDelete.type === WidgetType.FIELDS &&
        'viewId' in widgetToDelete.configuration &&
        isDefined(widgetToDelete.configuration.viewId)
      ) {
        deleteViewForFieldsWidget(
          widgetToDelete.configuration.viewId as string,
        );
      }

      const tabId = tabWithWidget?.id;

      if (isDefined(tabId)) {
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
      }

      const pageLayoutEditingWidgetId = store.get(
        pageLayoutEditingWidgetIdState,
      );

      if (pageLayoutEditingWidgetId === widgetId) {
        store.set(pageLayoutEditingWidgetIdState, null);
      }
    },
    [
      closeSidePanelMenu,
      deleteViewForFieldsWidget,
      deleteViewForRecordTableWidget,
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      pageLayoutEditingWidgetIdState,
      store,
    ],
  );

  return { deletePageLayoutWidget };
};
