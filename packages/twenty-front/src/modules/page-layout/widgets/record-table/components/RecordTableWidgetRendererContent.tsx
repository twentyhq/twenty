import { getContextStoreViewType } from '@/context-store/utils/getContextStoreViewType';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { RecordBoardWidget } from '@/object-record/record-board-widget/components/RecordBoardWidget';
import { RecordCalendarWidget } from '@/object-record/record-calendar-widget/components/RecordCalendarWidget';
import { RecordListWidget } from '@/object-record/record-list-widget/components/RecordListWidget';
import { RecordTableWidget } from '@/object-record/record-table-widget/components/RecordTableWidget';
import { RecordTableWidgetProvider } from '@/object-record/record-table-widget/components/RecordTableWidgetProvider';
import {
  type RecordTableWidgetJunctionCreateThrough,
  type RecordTableWidgetNestedRelationCreateThrough,
} from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { recordTableWidgetViewDraftByWidgetIdComponentFamilySelector } from '@/page-layout/states/selectors/recordTableWidgetViewDraftByWidgetIdComponentFamilySelector';
import {
  getRecordTableWidgetLayout,
  type RecordTableWidgetLayout,
} from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { constructViewFromRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/constructViewFromRecordTableWidgetViewSnapshot';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useViewById } from '@/views/hooks/useViewById';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ViewCalendarLayout, ViewType } from '~/generated-metadata/graphql';

type RecordTableWidgetRendererContentProps = {
  objectMetadataId: string;
  viewId: string;
  widgetId: string;
  isUIEditable?: boolean;
  isEmptyStateHidden?: boolean;
  recordLimit?: number;
  instanceIdSuffix?: string;
  nestedRelationCreateThrough?: RecordTableWidgetNestedRelationCreateThrough;
  junctionCreateThrough?: RecordTableWidgetJunctionCreateThrough;
};

export const RecordTableWidgetRendererContent = ({
  objectMetadataId,
  viewId,
  widgetId,
  isUIEditable = false,
  isEmptyStateHidden = false,
  recordLimit,
  instanceIdSuffix,
  nestedRelationCreateThrough,
  junctionCreateThrough,
}: RecordTableWidgetRendererContentProps) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const draftSnapshot = useAtomComponentFamilySelectorValue(
    recordTableWidgetViewDraftByWidgetIdComponentFamilySelector,
    { widgetId },
  );

  const { view: persistedView } = useViewById(viewId);

  const widgetView =
    isPageLayoutInEditMode && isDefined(draftSnapshot)
      ? constructViewFromRecordTableWidgetViewSnapshot(draftSnapshot)
      : persistedView;

  const widgetViewLayout = getRecordTableWidgetLayout(widgetView?.type);

  const isCalendarLayout = widgetViewLayout === ViewType.CALENDAR;

  // Widget calendars are read-only month projections, except live (non
  // edit-mode) day/week calendars, which allow drag-to-reschedule and
  // record creation under the usual object permissions.
  const isCalendarDayOrWeek =
    widgetView?.calendarLayout === ViewCalendarLayout.DAY ||
    widgetView?.calendarLayout === ViewCalendarLayout.WEEK;
  const canEditCalendar =
    isCalendarLayout && !isPageLayoutInEditMode && isCalendarDayOrWeek;
  // Read-only unless this is the explicitly allowed live day/week calendar.
  // Object permissions still gate the drag.
  const calendarIsReadOnly = !canEditCalendar;

  // Keyed rather than chained so a layout added to RECORD_TABLE_WIDGET_LAYOUTS
  // fails to compile here instead of silently rendering as a table.
  const renderWidgetForLayout = {
    [ViewType.TABLE]: () => (
      <RecordTableWidget
        isUIEditable={isUIEditable}
        isEmptyStateHidden={isEmptyStateHidden}
      />
    ),
    [ViewType.KANBAN]: () => <RecordBoardWidget isUIEditable={isUIEditable} />,
    [ViewType.LIST]: () => <RecordListWidget />,
    [ViewType.CALENDAR]: () => (
      <RecordCalendarWidget isReadOnly={calendarIsReadOnly} />
    ),
  } satisfies Record<RecordTableWidgetLayout, () => ReactNode>;

  return (
    <RecordTableWidgetProvider
      objectNameSingular={objectMetadataItem.nameSingular}
      viewId={viewId}
      widgetId={widgetId}
      recordLimit={recordLimit}
      instanceIdSuffix={instanceIdSuffix}
      nestedRelationCreateThrough={nestedRelationCreateThrough}
      junctionCreateThrough={junctionCreateThrough}
      contextStoreViewType={getContextStoreViewType(widgetViewLayout)}
    >
      {renderWidgetForLayout[widgetViewLayout]()}
    </RecordTableWidgetProvider>
  );
};
