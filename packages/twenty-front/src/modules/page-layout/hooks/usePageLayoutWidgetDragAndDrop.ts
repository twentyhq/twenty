import { type DragDropProvider } from '@dnd-kit/react';
import { useStore } from 'jotai';
import { type ComponentProps, useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { pageLayoutWidgetDragOverTabIdComponentState } from '@/page-layout/states/pageLayoutWidgetDragOverTabIdComponentState';
import { type PageLayoutWidgetDndData } from '@/page-layout/types/PageLayoutWidgetDndData';
import { moveWidgetToTabInDraft } from '@/page-layout/utils/moveWidgetToTabInDraft';
import { moveWidgetWithinTabInDraft } from '@/page-layout/utils/moveWidgetWithinTabInDraft';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

type Provider = typeof DragDropProvider<PageLayoutWidgetDndData>;
type DragStartEvent = Parameters<
  NonNullable<ComponentProps<Provider>['onDragStart']>
>[0];
type DragOverEvent = Parameters<
  NonNullable<ComponentProps<Provider>['onDragOver']>
>[0];
type DragEndEvent = Parameters<
  NonNullable<ComponentProps<Provider>['onDragEnd']>
>[0];

type DndTarget = {
  id?: unknown;
  group?: unknown;
  index?: unknown;
  data?: PageLayoutWidgetDndData;
} | null;

const getSourceData = (
  source: { data?: unknown } | null | undefined,
): PageLayoutWidgetDndData | undefined =>
  (source?.data ?? undefined) as PageLayoutWidgetDndData | undefined;

const getTarget = (target: unknown): DndTarget => target as DndTarget;

export const usePageLayoutWidgetDragAndDrop = (
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

  const store = useStore();

  const setPageLayoutDraggingWidgetId = useSetAtomComponentState(
    pageLayoutDraggingWidgetIdComponentState,
    pageLayoutId,
  );

  const setPageLayoutWidgetDragOverTabId = useSetAtomComponentState(
    pageLayoutWidgetDragOverTabIdComponentState,
    pageLayoutId,
  );

  const clearDragState = useCallback(() => {
    setPageLayoutDraggingWidgetId(null);
    setPageLayoutWidgetDragOverTabId(null);
  }, [setPageLayoutDraggingWidgetId, setPageLayoutWidgetDragOverTabId]);

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const sourceData = getSourceData(event.operation.source);

      if (sourceData?.type === 'widget') {
        setPageLayoutDraggingWidgetId(sourceData.widgetId);
      }
    },
    [setPageLayoutDraggingWidgetId],
  );

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      const sourceData = getSourceData(event.operation.source);
      const target = getTarget(event.operation.target);

      if (
        sourceData?.type === 'widget' &&
        target?.data?.type === 'tab-widget-drop' &&
        target.data.tabId !== sourceData.tabId
      ) {
        setPageLayoutWidgetDragOverTabId(target.data.tabId);
        return;
      }

      setPageLayoutWidgetDragOverTabId(null);
    },
    [setPageLayoutWidgetDragOverTabId],
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const sourceData = getSourceData(event.operation.source);

      if (event.canceled || sourceData?.type !== 'widget') {
        clearDragState();
        return;
      }

      const { widgetId, tabId: sourceTabId, index: sourceIndex } = sourceData;
      const target = getTarget(event.operation.target);

      if (!isDefined(target)) {
        clearDragState();
        return;
      }

      if (target.data?.type === 'tab-widget-drop') {
        if (target.data.tabId !== sourceTabId) {
          const destinationTabId = target.data.tabId;
          store.set(pageLayoutDraftState, (prev) =>
            moveWidgetToTabInDraft(prev, { widgetId, destinationTabId }),
          );
        }
        clearDragState();
        return;
      }

      if (isDefined(target.group)) {
        const destinationTabId = String(target.group);
        const destinationIndex = Number(target.index);

        if (Number.isInteger(destinationIndex)) {
          store.set(pageLayoutDraftState, (prev) =>
            destinationTabId === sourceTabId
              ? moveWidgetWithinTabInDraft(prev, {
                  tabId: sourceTabId,
                  fromIndex: sourceIndex,
                  toIndex: destinationIndex,
                })
              : moveWidgetToTabInDraft(prev, {
                  widgetId,
                  destinationTabId,
                  destinationIndex,
                }),
          );
        }
      }

      clearDragState();
    },
    [store, pageLayoutDraftState, clearDragState],
  );

  return { handlers: { onDragStart, onDragOver, onDragEnd } };
};
