import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { buildMissingRecordTableWidgetViewDraftSnapshots } from '@/page-layout/widgets/record-table/utils/buildMissingRecordTableWidgetViewDraftSnapshots';
import { buildRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshot';
import { constructViewFromRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/constructViewFromRecordTableWidgetViewSnapshot';
import { makeWidget } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const view = constructViewFromRecordTableWidgetViewSnapshot(
  buildRecordTableWidgetViewSnapshot(
    getMockObjectMetadataItemOrThrow('company'),
  ),
);

const makeViewBackedWidget = (
  id: string,
  viewId: string | undefined,
): PageLayoutWidget => {
  const widget = makeWidget(id, 0);

  return {
    ...widget,
    configuration: {
      ...widget.configuration,
      viewId,
    },
  } as PageLayoutWidget;
};

describe('buildMissingRecordTableWidgetViewDraftSnapshots', () => {
  it('should build a snapshot for a view-backed widget with no existing snapshot', () => {
    const snapshots = buildMissingRecordTableWidgetViewDraftSnapshots({
      widgets: [makeViewBackedWidget('widget-1', view.id)],
      existingSnapshotsByWidgetId: {},
      views: [view],
    });

    expect(snapshots['widget-1']).toBeDefined();
    expect(snapshots['widget-1'].view.id).toBe(view.id);
    expect(snapshots['widget-1'].viewFields.length).toBeGreaterThan(0);
  });

  it('should not overwrite an existing snapshot', () => {
    const existingSnapshot = buildRecordTableWidgetViewSnapshot(
      getMockObjectMetadataItemOrThrow('company'),
    );

    const snapshots = buildMissingRecordTableWidgetViewDraftSnapshots({
      widgets: [makeViewBackedWidget('widget-1', view.id)],
      existingSnapshotsByWidgetId: { 'widget-1': existingSnapshot },
      views: [view],
    });

    expect(snapshots).toEqual({});
  });

  it('should skip widgets whose configuration has no view', () => {
    const snapshots = buildMissingRecordTableWidgetViewDraftSnapshots({
      widgets: [makeViewBackedWidget('widget-1', undefined)],
      existingSnapshotsByWidgetId: {},
      views: [view],
    });

    expect(snapshots).toEqual({});
  });

  it('should skip widgets whose view is not loaded yet', () => {
    const snapshots = buildMissingRecordTableWidgetViewDraftSnapshots({
      widgets: [makeViewBackedWidget('widget-1', 'not-loaded-view-id')],
      existingSnapshotsByWidgetId: {},
      views: [view],
    });

    expect(snapshots).toEqual({});
  });

  it('should skip views that have no view fields yet', () => {
    const snapshots = buildMissingRecordTableWidgetViewDraftSnapshots({
      widgets: [makeViewBackedWidget('widget-1', view.id)],
      existingSnapshotsByWidgetId: {},
      views: [{ ...view, viewFields: [] }],
    });

    expect(snapshots).toEqual({});
  });
});
