import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import {
  CLOSE_DATE_FIELD,
  OBJECT_FIELDS,
  PERIOD_FILTER,
  SIGNED_AT_FIELD,
} from '@/page-layout/testing/dashboardFilterWidgetFixtures';
import {
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { getDashboardFilterWidgetRows } from '@/page-layout/utils/getDashboardFilterWidgetRows';
import { getDashboardFilterWidgets } from '@/page-layout/utils/getDashboardFilterWidgets';
import { type View } from '@/views/types/View';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';
import {
  TEST_AGGREGATE_CHART_CONFIGURATION,
  TEST_IFRAME_CONFIGURATION,
  TEST_OBJECT_METADATA_ID,
  createTestWidget,
} from '~/testing/mock-data/widget-configurations';

const THIRD_PARTY_APPLICATION_ID = 'acme-application';

const CURRENT_WORKSPACE = {
  workspaceCustomApplication: { id: 'workspace-application' },
  installedApplications: [
    { id: THIRD_PARTY_APPLICATION_ID, universalIdentifier: 'acme' },
  ],
} as Pick<
  CurrentWorkspace,
  'installedApplications' | 'workspaceCustomApplication'
>;

const RECORD_TABLE_WIDGET = createTestWidget({
  id: 'record-table',
  title: 'Deals',
  configuration: {
    __typename: 'RecordTableConfiguration',
    configurationType: WidgetConfigurationType.RECORD_TABLE,
    viewId: 'view-1',
  },
});

const buildViewFilters = (fieldMetadataId: string) => ({
  viewFilters: [{ fieldMetadataId }],
});

const getRows = ({
  tabs,
  persistedApplicationId = 'workspace-application',
  recordTableWidgetViewDrafts = {},
}: {
  tabs: ReturnType<typeof makeTab>[];
  persistedApplicationId?: string;
  recordTableWidgetViewDrafts?: Record<string, RecordTableWidgetViewSnapshot>;
}) =>
  getDashboardFilterWidgetRows({
    pageLayoutFilter: PERIOD_FILTER,
    dashboardFilterWidgets: getDashboardFilterWidgets({
      tabs,
      persistedWidgetsById: new Map([
        ['bar-chart', { applicationId: persistedApplicationId }],
      ]),
      objectMetadataItemsById: new Map([
        [TEST_OBJECT_METADATA_ID, { fields: OBJECT_FIELDS }],
      ]) as Parameters<
        typeof getDashboardFilterWidgets
      >[0]['objectMetadataItemsById'],
      viewsById: new Map([
        ['view-1', buildViewFilters(CLOSE_DATE_FIELD.id) as unknown as View],
      ]),
      recordTableWidgetViewDrafts,
      currentWorkspace: CURRENT_WORKSPACE,
    }),
  });

describe('getDashboardFilterWidgetRows', () => {
  it('should list every data widget of every active tab with its tab', () => {
    const rows = getRows({
      tabs: [
        makeTab('Overview', [
          createTestWidget({ id: 'bar-chart', title: 'Revenue' }),
          createTestWidget({
            id: 'iframe',
            configuration: TEST_IFRAME_CONFIGURATION,
          }),
          makeWidget('fields', 1),
        ]),
        makeTab('Pipeline', [
          RECORD_TABLE_WIDGET,
          createTestWidget({
            id: 'removed',
            configuration: TEST_AGGREGATE_CHART_CONFIGURATION,
            isActive: false,
          }),
        ]),
        makeTab('Hidden', [createTestWidget({ id: 'hidden' })], 2, undefined, {
          isActive: false,
        }),
      ],
    });

    expect(
      rows.map(({ widgetTitle, tabTitle, options }) => [
        widgetTitle,
        tabTitle,
        options[0].label,
      ]),
    ).toEqual([
      ['Revenue', 'Overview', 'Automatic (Close date)'],
      ['Deals', 'Pipeline', 'Automatic (Close date)'],
    ]);
  });

  it('should order the widgets by tab position, then by grid row and column', () => {
    const buildGridWidget = (id: string, row: number, column: number) =>
      createTestWidget({
        id,
        title: id,
        position: {
          __typename: 'PageLayoutWidgetGridPosition',
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row,
          column,
          rowSpan: 1,
          columnSpan: 1,
        },
      });

    const rows = getRows({
      tabs: [
        makeTab('Second', [buildGridWidget('second-tab-widget', 0, 0)], 1),
        makeTab('First', [
          buildGridWidget('lower-row', 2, 0),
          buildGridWidget('upper-row-right', 0, 6),
          buildGridWidget('upper-row-left', 0, 0),
        ]),
      ],
    });

    expect(rows.map(({ widgetTitle }) => widgetTitle)).toEqual([
      'upper-row-left',
      'upper-row-right',
      'lower-row',
      'second-tab-widget',
    ]);
  });

  it('should leave out the tab name on a single-tab dashboard', () => {
    const [row] = getRows({
      tabs: [makeTab('Overview', [createTestWidget({ id: 'bar-chart' })])],
    });

    expect(row.tabTitle).toBeNull();
    expect(row.isReadOnly).toBe(false);
  });

  it('should read the unsaved view filters of a record table first', () => {
    const [row] = getRows({
      tabs: [makeTab('Pipeline', [RECORD_TABLE_WIDGET])],
      recordTableWidgetViewDrafts: {
        'record-table': {
          view: {},
          viewFields: [],
          ...buildViewFilters(SIGNED_AT_FIELD.id),
        } as unknown as RecordTableWidgetViewSnapshot,
      },
    });

    expect(row.resolution).toEqual({
      fieldMetadataId: SIGNED_AT_FIELD.id,
      source: 'WIDGET_FILTER',
    });
  });

  it('should make a saved widget of a third-party app read-only', () => {
    const [row] = getRows({
      tabs: [makeTab('Overview', [createTestWidget({ id: 'bar-chart' })])],
      persistedApplicationId: THIRD_PARTY_APPLICATION_ID,
    });

    expect(row.isReadOnly).toBe(true);
  });
});
