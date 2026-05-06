import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { usePerformViewAPIPersist } from '@/views/hooks/internal/usePerformViewAPIPersist';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

export const useCreatePendingRecordTableWidgetViews = () => {
  const { performViewAPICreate, performViewAPIDestroy } =
    usePerformViewAPIPersist();
  const store = useStore();

  const createPendingRecordTableWidgetViews = useCallback(
    async (pageLayoutId: string) => {
      const draft = store.get(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );
      const persisted = store.get(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );

      const recordTableWidgetViewDraft = store.get(
        recordTableWidgetViewDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );

      const persistedRecordTableWidgets = new Map(
        (persisted?.tabs ?? [])
          .flatMap((tab) => tab.widgets)
          .filter((widget) => widget.type === WidgetType.RECORD_TABLE)
          .map((widget) => [
            widget.id,
            getWidgetConfigurationViewId(widget.configuration),
          ]),
      );

      const draftRecordTableWidgets = draft.tabs
        .flatMap((tab) => tab.widgets)
        .filter((widget) => widget.type === WidgetType.RECORD_TABLE);

      const draftWidgetIds = new Set(
        draftRecordTableWidgets.map((widget) => widget.id),
      );

      for (const widget of draftRecordTableWidgets) {
        const viewId = getWidgetConfigurationViewId(widget.configuration);

        if (!isDefined(viewId)) {
          continue;
        }

        const persistedViewId = persistedRecordTableWidgets.get(widget.id);

        if (persistedViewId === viewId) {
          continue;
        }

        if (isDefined(persistedViewId)) {
          await performViewAPIDestroy({ id: persistedViewId });
        }

        const widgetViewDraft = recordTableWidgetViewDraft[widget.id];

        if (!isDefined(widgetViewDraft)) {
          continue;
        }

        const { view } = widgetViewDraft;

        const result = await performViewAPICreate(
          {
            input: {
              id: view.id,
              name: view.name,
              icon: view.icon,
              objectMetadataId: view.objectMetadataId,
              type: view.type,
              isCompact: view.isCompact,
              position: view.position,
              openRecordIn: view.openRecordIn,
              visibility: view.visibility,
              shouldHideEmptyGroups: view.shouldHideEmptyGroups,
            },
          },
          view.objectMetadataId,
        );

        if (result.status === 'failed') {
          throw new Error(
            `Failed to create view for RECORD_TABLE widget ${widget.id}`,
          );
        }
      }

      for (const [widgetId, viewId] of persistedRecordTableWidgets) {
        if (!draftWidgetIds.has(widgetId) && isDefined(viewId)) {
          await performViewAPIDestroy({ id: viewId });
        }
      }
    },
    [performViewAPICreate, performViewAPIDestroy, store],
  );

  return { createPendingRecordTableWidgetViews };
};
