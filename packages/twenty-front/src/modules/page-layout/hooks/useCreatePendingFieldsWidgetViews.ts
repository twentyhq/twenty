import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { usePerformViewApiPersist } from '@/views/hooks/internal/usePerformViewApiPersist';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ViewType, WidgetType } from '~/generated-metadata/graphql';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useCreatePendingFieldsWidgetViews = () => {
  const surfaceId = useComponentStateSurfaceId();
  const { performViewApiCreate } = usePerformViewApiPersist();
  const store = useStore();

  const createPendingFieldsWidgetViews = useCallback(
    async (pageLayoutId: string) => {
      const draft = store.get(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
      );
      const persisted = store.get(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
          surfaceId,
        }),
      );

      const persistedWidgetIds = new Set(
        persisted?.tabs.flatMap((tab) =>
          tab.widgets.map((widget) => widget.id),
        ) ?? [],
      );

      const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

      const newFieldsWidgets = draft.tabs
        .flatMap((tab) => tab.widgets)
        .filter((widget) => {
          if (widget.type !== WidgetType.FIELDS) {
            return false;
          }
          const viewId = getWidgetConfigurationViewId(widget.configuration);

          return isDefined(viewId) && !persistedWidgetIds.has(widget.id);
        });

      for (const widget of newFieldsWidgets) {
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

        const result = await performViewApiCreate(
          {
            input: {
              id: viewId,
              name: viewName,
              icon: 'IconListDetails',
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
    [performViewApiCreate, store, surfaceId],
  );

  return { createPendingFieldsWidgetViews };
};
