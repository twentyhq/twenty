import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { buildDraftViewGroupsForFieldMetadataItem } from '@/page-layout/widgets/record-table/utils/buildDraftViewGroupsForFieldMetadataItem';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { ViewType } from '~/generated-metadata/graphql';

export type RecordTableWidgetLayoutViewType =
  | ViewType.TABLE_WIDGET
  | ViewType.KANBAN_WIDGET;

type UseRecordTableWidgetLayoutCallbacksParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useRecordTableWidgetLayoutCallbacks = ({
  pageLayoutId,
  widgetId,
}: UseRecordTableWidgetLayoutCallbacksParams) => {
  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const handleGroupByFieldChange = (
    fieldMetadataItem: FieldMetadataItem | null,
  ) => {
    store.set(recordTableWidgetViewDraftState, (prev) => {
      const widgetViewDraft = prev[widgetId];

      if (!isDefined(widgetViewDraft)) {
        return prev;
      }

      return {
        ...prev,
        [widgetId]: {
          ...widgetViewDraft,
          view: {
            ...widgetViewDraft.view,
            mainGroupByFieldMetadataId: fieldMetadataItem?.id ?? null,
          },
          viewGroups: isDefined(fieldMetadataItem)
            ? buildDraftViewGroupsForFieldMetadataItem({
                viewId: widgetViewDraft.view.id,
                fieldMetadataItem,
              })
            : [],
        },
      };
    });
  };

  const handleLayoutChange = ({
    targetViewType,
    defaultGroupByFieldMetadataItem,
  }: {
    targetViewType: RecordTableWidgetLayoutViewType;
    defaultGroupByFieldMetadataItem: FieldMetadataItem | null;
  }) => {
    store.set(recordTableWidgetViewDraftState, (prev) => {
      const widgetViewDraft = prev[widgetId];

      if (!isDefined(widgetViewDraft)) {
        return prev;
      }

      if (targetViewType === ViewType.KANBAN_WIDGET) {
        const hasGroupBy = isDefined(
          widgetViewDraft.view.mainGroupByFieldMetadataId,
        );

        if (!hasGroupBy && !isDefined(defaultGroupByFieldMetadataItem)) {
          return prev;
        }

        return {
          ...prev,
          [widgetId]: {
            ...widgetViewDraft,
            view: {
              ...widgetViewDraft.view,
              type: targetViewType,
              mainGroupByFieldMetadataId: hasGroupBy
                ? widgetViewDraft.view.mainGroupByFieldMetadataId
                : defaultGroupByFieldMetadataItem?.id,
            },
            viewGroups:
              hasGroupBy || !isDefined(defaultGroupByFieldMetadataItem)
                ? widgetViewDraft.viewGroups
                : buildDraftViewGroupsForFieldMetadataItem({
                    viewId: widgetViewDraft.view.id,
                    fieldMetadataItem: defaultGroupByFieldMetadataItem,
                  }),
          },
        };
      }

      return {
        ...prev,
        [widgetId]: {
          ...widgetViewDraft,
          view: {
            ...widgetViewDraft.view,
            type: targetViewType,
          },
        },
      };
    });
  };

  const handleShouldHideEmptyGroupsChange = (
    shouldHideEmptyGroups: boolean,
  ) => {
    store.set(recordTableWidgetViewDraftState, (prev) => {
      const widgetViewDraft = prev[widgetId];

      if (!isDefined(widgetViewDraft)) {
        return prev;
      }

      return {
        ...prev,
        [widgetId]: {
          ...widgetViewDraft,
          view: {
            ...widgetViewDraft.view,
            shouldHideEmptyGroups,
          },
        },
      };
    });
  };

  return {
    handleGroupByFieldChange,
    handleLayoutChange,
    handleShouldHideEmptyGroupsChange,
  };
};
