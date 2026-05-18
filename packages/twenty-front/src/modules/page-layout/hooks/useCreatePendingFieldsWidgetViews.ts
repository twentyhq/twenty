import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { usePerformViewAPIPersist } from '@/views/hooks/internal/usePerformViewAPIPersist';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import { ViewType, WidgetType } from '~/generated-metadata/graphql';

export const useCreatePendingFieldsWidgetViews = () => {
  const { performViewAPICreate } = usePerformViewAPIPersist();
  const store = useStore();

  const createPendingFieldsWidgetViews = useCallback(
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

      const persistedFieldsWidgetViewIdsByWidgetId = new Map(
        (persisted?.tabs ?? [])
          .flatMap((tab) => tab.widgets)
          .filter((widget) => widget.type === WidgetType.FIELDS)
          .map((widget) => [
            widget.id,
            getWidgetConfigurationViewId(widget.configuration),
          ]),
      );

      const draftWithGeneratedViewIds = {
        ...draft,
        tabs: draft.tabs.map((tab) => ({
          ...tab,
          widgets: tab.widgets.map((widget) => {
            if (widget.type !== WidgetType.FIELDS) {
              return widget;
            }

            const viewId = getWidgetConfigurationViewId(widget.configuration);

            if (isDefined(viewId)) {
              return widget;
            }

            return {
              ...widget,
              configuration: {
                ...widget.configuration,
                viewId: uuidv4(),
              },
            };
          }),
        })),
      };

      store.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
        draftWithGeneratedViewIds,
      );

      const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

      const fieldsWidgetsToPersist = draftWithGeneratedViewIds.tabs
        .flatMap((tab) => tab.widgets)
        .filter((widget) => {
          if (widget.type !== WidgetType.FIELDS) {
            return false;
          }

          const viewId = getWidgetConfigurationViewId(widget.configuration);

          if (!isDefined(viewId)) {
            return false;
          }

          const persistedViewId =
            persistedFieldsWidgetViewIdsByWidgetId.get(widget.id);

          return persistedViewId !== viewId;
        });

      for (const widget of fieldsWidgetsToPersist) {
        const viewId = getWidgetConfigurationViewId(widget.configuration);

        if (!isDefined(viewId)) {
          continue;
        }

        const objectMetadataId =
          widget.objectMetadataId ?? draft.objectMetadataId;

        if (!isDefined(objectMetadataId)) {
          continue;
        }

        const objectMetadataItem = objectMetadataItems.find(
          (item) => item.id === objectMetadataId,
        );

        const viewName = isDefined(objectMetadataItem)
          ? `${objectMetadataItem.labelSingular} Fields`
          : 'Fields';

        const result = await performViewAPICreate(
          {
            input: {
              id: viewId,
              name: viewName,
              icon: 'IconList',
              objectMetadataId,
              type: ViewType.FIELDS_WIDGET,
            },
          },
          objectMetadataId,
        );

        if (result.status === 'failed') {
          throw new Error(
            `Failed to create view for FIELDS widget ${widget.id}`,
          );
        }
      }
    },
    [performViewAPICreate, store],
  );

  return { createPendingFieldsWidgetViews };
};
