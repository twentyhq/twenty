import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { type RecordTableWidgetLayoutViewType } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { applyLayoutToRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/applyLayoutToRecordTableWidgetViewSnapshot';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { buildDraftViewGroupsForFieldMetadataItem } from '@/page-layout/widgets/record-table/utils/buildDraftViewGroupsForFieldMetadataItem';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

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

  // Returning the snapshot unchanged publishes no state update.
  const setWidgetViewDraft = useCallback(
    (
      updater: (
        widgetViewDraft: RecordTableWidgetViewSnapshot,
      ) => RecordTableWidgetViewSnapshot,
    ) => {
      store.set(recordTableWidgetViewDraftState, (prev) => {
        const widgetViewDraft = prev[widgetId];

        if (!isDefined(widgetViewDraft)) {
          return prev;
        }

        const updatedWidgetViewDraft = updater(widgetViewDraft);

        if (updatedWidgetViewDraft === widgetViewDraft) {
          return prev;
        }

        return {
          ...prev,
          [widgetId]: updatedWidgetViewDraft,
        };
      });
    },
    [recordTableWidgetViewDraftState, store, widgetId],
  );

  const handleGroupByFieldChange = (
    fieldMetadataItem: FieldMetadataItem | null,
  ) => {
    setWidgetViewDraft((widgetViewDraft) => ({
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
    }));
  };

  const handleLayoutChange = ({
    targetViewType,
    defaultGroupByFieldMetadataItem,
    defaultCalendarFieldMetadataItem,
  }: {
    targetViewType: RecordTableWidgetLayoutViewType;
    defaultGroupByFieldMetadataItem: FieldMetadataItem | null;
    defaultCalendarFieldMetadataItem?: FieldMetadataItem | null;
  }) => {
    setWidgetViewDraft((widgetViewDraft) =>
      applyLayoutToRecordTableWidgetViewSnapshot({
        widgetViewSnapshot: widgetViewDraft,
        targetViewType,
        defaultGroupByFieldMetadataItem,
        defaultCalendarFieldMetadataItem,
      }),
    );
  };

  const handleCalendarFieldChange = (fieldMetadataItem: FieldMetadataItem) => {
    setWidgetViewDraft((widgetViewDraft) => ({
      ...widgetViewDraft,
      view: {
        ...widgetViewDraft.view,
        calendarFieldMetadataId: fieldMetadataItem.id,
        calendarEndFieldMetadataId: null,
        calendarLayout:
          widgetViewDraft.view.calendarLayout ?? ViewCalendarLayout.MONTH,
      },
    }));
  };

  const handleCalendarLayoutChange = (calendarLayout: ViewCalendarLayout) => {
    setWidgetViewDraft((widgetViewDraft) => ({
      ...widgetViewDraft,
      view: {
        ...widgetViewDraft.view,
        calendarLayout,
      },
    }));
  };

  const handleShouldHideEmptyGroupsChange = (
    shouldHideEmptyGroups: boolean,
  ) => {
    setWidgetViewDraft((widgetViewDraft) => ({
      ...widgetViewDraft,
      view: {
        ...widgetViewDraft.view,
        shouldHideEmptyGroups,
      },
    }));
  };

  return {
    handleCalendarFieldChange,
    handleCalendarLayoutChange,
    handleGroupByFieldChange,
    handleLayoutChange,
    handleShouldHideEmptyGroupsChange,
  };
};
