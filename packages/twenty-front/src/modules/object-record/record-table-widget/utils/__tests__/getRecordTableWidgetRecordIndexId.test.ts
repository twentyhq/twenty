import { getRecordTableWidgetRecordIndexId } from '@/object-record/record-table-widget/utils/getRecordTableWidgetRecordIndexId';

describe('getRecordTableWidgetRecordIndexId', () => {
  it('should isolate widgets backed by the same view', () => {
    const firstWidgetRecordIndexId = getRecordTableWidgetRecordIndexId({
      objectNamePlural: 'people',
      viewId: 'view-id',
      widgetId: 'first-widget-id',
    });
    const secondWidgetRecordIndexId = getRecordTableWidgetRecordIndexId({
      objectNamePlural: 'people',
      viewId: 'view-id',
      widgetId: 'second-widget-id',
    });

    expect(firstWidgetRecordIndexId).toBe(
      'people-view-id-widget-first-widget-id',
    );
    expect(secondWidgetRecordIndexId).not.toBe(firstWidgetRecordIndexId);
  });

  it('should isolate repeated field widgets by rendered record', () => {
    expect(
      getRecordTableWidgetRecordIndexId({
        objectNamePlural: 'people',
        viewId: 'view-id',
        widgetId: 'widget-id',
        instanceIdSuffix: 'record-id-side-panel',
      }),
    ).toBe('people-view-id-widget-widget-id-record-id-side-panel');
  });
});
