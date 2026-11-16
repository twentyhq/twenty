import { buildRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshot';
import { isFieldMetadataItemAvailableAsCalendarField } from '@/object-record/record-calendar/utils/isFieldMetadataItemAvailableAsCalendarField';
import { isFieldMetadataItemAvailableAsWidgetGroupByField } from '@/page-layout/widgets/record-table/utils/isFieldMetadataItemAvailableAsWidgetGroupByField';
import { getRecordTableWidgetViewSnapshotWithLayout } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetViewSnapshotWithLayout';
import { ViewCalendarLayout, ViewType } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('getRecordTableWidgetViewSnapshotWithLayout', () => {
  const opportunityObjectMetadataItem =
    getMockObjectMetadataItemOrThrow('opportunity');
  const widgetViewSnapshot = buildRecordTableWidgetViewSnapshot(
    opportunityObjectMetadataItem,
  );
  const defaultFields = {
    defaultGroupByFieldMetadataItem:
      opportunityObjectMetadataItem.fields.find(
        isFieldMetadataItemAvailableAsWidgetGroupByField,
      ) ?? null,
    defaultCalendarFieldMetadataItem:
      opportunityObjectMetadataItem.fields.find(
        isFieldMetadataItemAvailableAsCalendarField,
      ) ?? null,
  };

  it('should group a kanban by the default select field', () => {
    const result = getRecordTableWidgetViewSnapshotWithLayout({
      widgetViewSnapshot,
      targetViewType: ViewType.KANBAN_WIDGET,
      ...defaultFields,
    });

    expect(defaultFields.defaultGroupByFieldMetadataItem).not.toBeNull();
    expect(result.view.type).toBe(ViewType.KANBAN_WIDGET);
    expect(result.view.mainGroupByFieldMetadataId).toBe(
      defaultFields.defaultGroupByFieldMetadataItem?.id,
    );
    expect(result.viewGroups.length).toBeGreaterThan(0);
  });

  it('should leave the snapshot unchanged when a kanban has no field to group by', () => {
    const result = getRecordTableWidgetViewSnapshotWithLayout({
      widgetViewSnapshot,
      targetViewType: ViewType.KANBAN_WIDGET,
      defaultGroupByFieldMetadataItem: null,
    });

    expect(result).toBe(widgetViewSnapshot);
  });

  it('should set a calendar on the default date field with a month layout', () => {
    const result = getRecordTableWidgetViewSnapshotWithLayout({
      widgetViewSnapshot,
      targetViewType: ViewType.CALENDAR_WIDGET,
      ...defaultFields,
    });

    expect(result.view).toMatchObject({
      type: ViewType.CALENDAR_WIDGET,
      calendarLayout: ViewCalendarLayout.MONTH,
      calendarFieldMetadataId:
        defaultFields.defaultCalendarFieldMetadataItem?.id,
    });
  });

  it('should only switch the view type for a list', () => {
    const result = getRecordTableWidgetViewSnapshotWithLayout({
      widgetViewSnapshot,
      targetViewType: ViewType.LIST_WIDGET,
      ...defaultFields,
    });

    expect(result).toEqual({
      ...widgetViewSnapshot,
      view: { ...widgetViewSnapshot.view, type: ViewType.LIST_WIDGET },
    });
  });
});
