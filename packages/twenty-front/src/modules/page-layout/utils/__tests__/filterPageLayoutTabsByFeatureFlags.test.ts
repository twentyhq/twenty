import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { filterPageLayoutTabsByFeatureFlags } from '@/page-layout/utils/filterPageLayoutTabsByFeatureFlags';
import {
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const createMockWidget = (
  id: string,
  type: WidgetType,
): PageLayoutTab['widgets'][0] => ({
  __typename: 'PageLayoutWidget',
  id,
  applicationId: '',
  isActive: true,
  pageLayoutTabId: 'tab-1',
  title: `Widget ${id}`,
  type,
  objectMetadataId: null,
  gridPosition: {
    __typename: 'GridPosition',
    row: 0,
    column: 0,
    rowSpan: 1,
    columnSpan: 1,
  },
  configuration: {
    __typename: 'FieldsConfiguration',
    configurationType: WidgetConfigurationType.FIELDS,
    viewId: null,
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
  conditionalDisplay: null,
});

const createMockTab = (
  id: string,
  widgets: PageLayoutTab['widgets'],
): PageLayoutTab => ({
  __typename: 'PageLayoutTab',
  applicationId: '',
  id,
  isActive: true,
  pageLayoutId: 'page-layout-1',
  title: `Tab ${id}`,
  position: 0,
  widgets,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
});

describe('filterPageLayoutTabsByFeatureFlags', () => {
  it('removes a native call recording tab when the feature is disabled', () => {
    const tabs = [
      createMockTab('transcript-tab', [
        createMockWidget(
          'transcript-widget',
          WidgetType.CALL_RECORDING_TRANSCRIPT,
        ),
      ]),
    ];

    expect(
      filterPageLayoutTabsByFeatureFlags({
        tabs,
        isNativeCallRecordingTabsEnabled: false,
      }),
    ).toEqual([]);
  });

  it('gates summary and transcript with the same feature', () => {
    const tabs = [
      createMockTab('summary-tab', [
        createMockWidget('summary-widget', WidgetType.CALL_RECORDING_SUMMARY),
      ]),
      createMockTab('transcript-tab', [
        createMockWidget(
          'transcript-widget',
          WidgetType.CALL_RECORDING_TRANSCRIPT,
        ),
      ]),
    ];

    expect(
      filterPageLayoutTabsByFeatureFlags({
        tabs,
        isNativeCallRecordingTabsEnabled: false,
      }),
    ).toEqual([]);
  });

  it('preserves unrelated widgets in a mixed tab', () => {
    const tabs = [
      createMockTab('mixed-tab', [
        createMockWidget('fields-widget', WidgetType.FIELDS),
        createMockWidget(
          'transcript-widget',
          WidgetType.CALL_RECORDING_TRANSCRIPT,
        ),
      ]),
    ];

    const filteredTabs = filterPageLayoutTabsByFeatureFlags({
      tabs,
      isNativeCallRecordingTabsEnabled: false,
    });

    expect(filteredTabs).toHaveLength(1);
    expect(filteredTabs[0].widgets.map((widget) => widget.id)).toEqual([
      'fields-widget',
    ]);
  });

  it('preserves an unrelated tab that was already empty', () => {
    const emptyTab = createMockTab('empty-tab', []);

    expect(
      filterPageLayoutTabsByFeatureFlags({
        tabs: [emptyTab],
        isNativeCallRecordingTabsEnabled: false,
      }),
    ).toEqual([emptyTab]);
  });

  it('returns all tabs unchanged when the feature is enabled', () => {
    const tabs = [
      createMockTab('summary-tab', [
        createMockWidget('summary-widget', WidgetType.CALL_RECORDING_SUMMARY),
      ]),
      createMockTab('transcript-tab', [
        createMockWidget(
          'transcript-widget',
          WidgetType.CALL_RECORDING_TRANSCRIPT,
        ),
      ]),
    ];

    expect(
      filterPageLayoutTabsByFeatureFlags({
        tabs,
        isNativeCallRecordingTabsEnabled: true,
      }),
    ).toBe(tabs);
  });
});
