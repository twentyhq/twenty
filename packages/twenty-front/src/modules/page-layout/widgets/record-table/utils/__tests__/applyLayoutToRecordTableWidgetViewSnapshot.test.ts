import { applyLayoutToRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/applyLayoutToRecordTableWidgetViewSnapshot';
import { buildRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshot';
import { getRecordTableWidgetLayoutDefaultFields } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutDefaultFields';
import { ViewCalendarLayout, ViewType } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

const { defaultGroupByFieldMetadataItem, defaultCalendarFieldMetadataItem } =
  getRecordTableWidgetLayoutDefaultFields(opportunityObjectMetadataItem);

const widgetViewSnapshot = buildRecordTableWidgetViewSnapshot(
  opportunityObjectMetadataItem,
);

describe('applyLayoutToRecordTableWidgetViewSnapshot', () => {
  it('should group a kanban by the default select field', () => {
    const kanbanSnapshot = applyLayoutToRecordTableWidgetViewSnapshot({
      widgetViewSnapshot,
      targetViewType: ViewType.KANBAN_WIDGET,
      defaultGroupByFieldMetadataItem,
    });

    expect(kanbanSnapshot.view.type).toBe(ViewType.KANBAN_WIDGET);
    expect(kanbanSnapshot.view.mainGroupByFieldMetadataId).toBe(
      defaultGroupByFieldMetadataItem?.id,
    );
    expect(kanbanSnapshot.viewGroups.length).toBeGreaterThan(0);
  });

  it('should leave the snapshot untouched when kanban has no field to group by', () => {
    expect(
      applyLayoutToRecordTableWidgetViewSnapshot({
        widgetViewSnapshot,
        targetViewType: ViewType.KANBAN_WIDGET,
        defaultGroupByFieldMetadataItem: null,
      }),
    ).toBe(widgetViewSnapshot);
  });

  it('should lay a calendar out by month on the default date field', () => {
    const calendarSnapshot = applyLayoutToRecordTableWidgetViewSnapshot({
      widgetViewSnapshot,
      targetViewType: ViewType.CALENDAR_WIDGET,
      defaultGroupByFieldMetadataItem: null,
      defaultCalendarFieldMetadataItem,
    });

    expect(calendarSnapshot.view).toMatchObject({
      type: ViewType.CALENDAR_WIDGET,
      calendarLayout: ViewCalendarLayout.MONTH,
      calendarFieldMetadataId: defaultCalendarFieldMetadataItem?.id,
    });
  });

  it('should switch a list to compact and leave the rest untouched', () => {
    expect(
      applyLayoutToRecordTableWidgetViewSnapshot({
        widgetViewSnapshot,
        targetViewType: ViewType.LIST_WIDGET,
        defaultGroupByFieldMetadataItem: null,
      }),
    ).toEqual({
      ...widgetViewSnapshot,
      view: {
        ...widgetViewSnapshot.view,
        type: ViewType.LIST_WIDGET,
        isCompact: true,
      },
    });
  });

  it('should turn Compact view off when a list becomes another layout', () => {
    const listSnapshot = applyLayoutToRecordTableWidgetViewSnapshot({
      widgetViewSnapshot,
      targetViewType: ViewType.LIST_WIDGET,
      defaultGroupByFieldMetadataItem: null,
    });

    expect(
      applyLayoutToRecordTableWidgetViewSnapshot({
        widgetViewSnapshot: listSnapshot,
        targetViewType: ViewType.TABLE_WIDGET,
        defaultGroupByFieldMetadataItem: null,
      }).view,
    ).toMatchObject({ type: ViewType.TABLE_WIDGET, isCompact: false });
  });

  it('should keep Compact view between layouts that are not lists', () => {
    expect(
      applyLayoutToRecordTableWidgetViewSnapshot({
        widgetViewSnapshot: {
          ...widgetViewSnapshot,
          view: {
            ...widgetViewSnapshot.view,
            type: ViewType.KANBAN_WIDGET,
            isCompact: true,
          },
        },
        targetViewType: ViewType.CALENDAR_WIDGET,
        defaultGroupByFieldMetadataItem: null,
        defaultCalendarFieldMetadataItem,
      }).view,
    ).toMatchObject({ type: ViewType.CALENDAR_WIDGET, isCompact: true });
  });
});
