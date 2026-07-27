import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getSupportedRecordCalendarLayout } from '@/object-record/record-calendar/utils/getSupportedRecordCalendarLayout';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { buildDraftViewGroupsForFieldMetadataItem } from '@/page-layout/widgets/record-table/utils/buildDraftViewGroupsForFieldMetadataItem';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  type ViewCalendarLayout,
  ViewType,
} from '~/generated-metadata/graphql';

export type RecordTableWidgetLayoutViewType =
  | ViewType.TABLE_WIDGET
  | ViewType.KANBAN_WIDGET
  | ViewType.CALENDAR_WIDGET;

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

  const isCalendarWeekViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED,
  );

  // Clamp a widget calendar's layout to what the workspace supports (MONTH
  // while the day/week feature is off), reusing the shared resolver so widget
  // and index calendars can't diverge and no stale day/week value is sent back
  // to — and rejected by — the server.
  const resolveCalendarLayout = (
    calendarLayout: ViewCalendarLayout | null | undefined,
  ) =>
    getSupportedRecordCalendarLayout({
      calendarLayout,
      isCalendarWeekViewEnabled,
    });

  // Returning the received snapshot unchanged from the updater leaves the
  // whole draft map untouched (no state update is published).
  const setWidgetViewDraft = (
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
  };

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
    setWidgetViewDraft((widgetViewDraft) => {
      if (targetViewType === ViewType.KANBAN_WIDGET) {
        const hasGroupBy = isDefined(
          widgetViewDraft.view.mainGroupByFieldMetadataId,
        );

        if (!hasGroupBy && !isDefined(defaultGroupByFieldMetadataItem)) {
          return widgetViewDraft;
        }

        return {
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
        };
      }

      if (targetViewType === ViewType.CALENDAR_WIDGET) {
        const hasCalendarField = isDefined(
          widgetViewDraft.view.calendarFieldMetadataId,
        );

        if (!hasCalendarField && !isDefined(defaultCalendarFieldMetadataItem)) {
          return widgetViewDraft;
        }

        return {
          ...widgetViewDraft,
          view: {
            ...widgetViewDraft.view,
            type: targetViewType,
            calendarLayout: resolveCalendarLayout(
              widgetViewDraft.view.calendarLayout,
            ),
            calendarFieldMetadataId: hasCalendarField
              ? widgetViewDraft.view.calendarFieldMetadataId
              : defaultCalendarFieldMetadataItem?.id,
          },
        };
      }

      return {
        ...widgetViewDraft,
        view: {
          ...widgetViewDraft.view,
          type: targetViewType,
        },
      };
    });
  };

  const handleCalendarFieldChange = (fieldMetadataItem: FieldMetadataItem) => {
    setWidgetViewDraft((widgetViewDraft) => ({
      ...widgetViewDraft,
      view: {
        ...widgetViewDraft.view,
        calendarFieldMetadataId: fieldMetadataItem.id,
        calendarLayout: resolveCalendarLayout(
          widgetViewDraft.view.calendarLayout,
        ),
      },
    }));
  };

  const handleCalendarLayoutChange = (calendarLayout: ViewCalendarLayout) => {
    setWidgetViewDraft((widgetViewDraft) => ({
      ...widgetViewDraft,
      view: {
        ...widgetViewDraft.view,
        calendarLayout: resolveCalendarLayout(calendarLayout),
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
