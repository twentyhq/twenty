import { UPSERT_VIEW_WIDGET } from '@/page-layout/graphql/mutations/upsertViewWidget';
import { useHasRecordTableWidgetViewChanges } from '@/page-layout/hooks/useHasRecordTableWidgetViewChanges';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { recordTableWidgetViewPersistedComponentState } from '@/page-layout/states/recordTableWidgetViewPersistedComponentState';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  type UpsertViewWidgetInput,
  type ViewFragmentFragment,
  WidgetType,
} from '~/generated-metadata/graphql';

export const useSaveRecordTableWidgetViews = () => {
  const [upsertViewWidgetMutation] = useMutation<
    { upsertViewWidget: ViewFragmentFragment },
    { input: UpsertViewWidgetInput }
  >(UPSERT_VIEW_WIDGET);

  const { hasRecordTableWidgetViewChanges } =
    useHasRecordTableWidgetViewChanges();

  const store = useStore();

  const saveRecordTableWidgetViews = useCallback(
    async (pageLayoutId: string) => {
      if (!hasRecordTableWidgetViewChanges(pageLayoutId)) {
        return;
      }

      const draft = store.get(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );

      const recordTableWidgetViewDraft = store.get(
        recordTableWidgetViewDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );

      const draftRecordTableWidgets = draft.tabs
        .flatMap((tab) => tab.widgets)
        .filter((widget) => widget.type === WidgetType.RECORD_TABLE);

      for (const widget of draftRecordTableWidgets) {
        const viewId = getWidgetConfigurationViewId(widget.configuration);

        if (!isDefined(viewId)) {
          continue;
        }

        const widgetViewDraft = recordTableWidgetViewDraft[widget.id];

        if (!isDefined(widgetViewDraft)) {
          continue;
        }

        await upsertViewWidgetMutation({
          variables: {
            input: {
              widgetId: widget.id,
              viewFields: widgetViewDraft.viewFields.map((field) => ({
                fieldMetadataId: field.fieldMetadataId,
                isVisible: field.isVisible,
                position: field.position,
                size: field.size,
              })),
              viewFilters: widgetViewDraft.viewFilters.map((filter) => ({
                id: filter.id,
                fieldMetadataId: filter.fieldMetadataId,
                operand: filter.operand,
                value: filter.value,
                viewFilterGroupId: filter.viewFilterGroupId ?? undefined,
                positionInViewFilterGroup:
                  filter.positionInViewFilterGroup ?? undefined,
                subFieldName: filter.subFieldName ?? undefined,
              })),
              viewFilterGroups: widgetViewDraft.viewFilterGroups.map(
                (group) => ({
                  id: group.id,
                  parentViewFilterGroupId:
                    group.parentViewFilterGroupId ?? undefined,
                  logicalOperator: group.logicalOperator,
                  positionInViewFilterGroup:
                    group.positionInViewFilterGroup ?? undefined,
                }),
              ),
              viewSorts: widgetViewDraft.viewSorts.map((sort) => ({
                id: sort.id,
                fieldMetadataId: sort.fieldMetadataId,
                direction: sort.direction,
              })),
            },
          },
        });
      }

      store.set(
        recordTableWidgetViewPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
        recordTableWidgetViewDraft,
      );
    },
    [hasRecordTableWidgetViewChanges, store, upsertViewWidgetMutation],
  );

  return { saveRecordTableWidgetViews };
};
