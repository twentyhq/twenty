import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { dropDashboardFilterBindingsToRemovedFilters } from '@/page-layout/utils/dropDashboardFilterBindingsToRemovedFilters';
import {
  type DashboardFilterBinding,
  PageLayoutFilterType,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import {
  TEST_BAR_CHART_CONFIGURATION,
  TEST_FIELD_METADATA_ID_1,
  createTestWidget,
} from '~/testing/mock-data/widget-configurations';

const PERIOD_FILTER = {
  id: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e01',
  label: 'Period',
  type: PageLayoutFilterType.DATE,
  position: 0,
  defaultValue: null,
};

const PERIOD_BINDING: DashboardFilterBinding = {
  __typename: 'DashboardFilterBinding',
  pageLayoutFilterId: PERIOD_FILTER.id,
  fieldMetadataId: TEST_FIELD_METADATA_ID_1,
};

const REMOVED_FILTER_BINDING: DashboardFilterBinding = {
  __typename: 'DashboardFilterBinding',
  pageLayoutFilterId: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e03',
  fieldMetadataId: null,
};

const buildDraft = (widgets: PageLayoutWidget[]): DraftPageLayout => ({
  id: 'page-layout-1',
  name: 'Test Dashboard',
  type: PageLayoutType.DASHBOARD,
  isFirstTabPinned: true,
  objectMetadataId: null,
  defaultTabToFocusOnMobileAndSidePanelId: null,
  tabs: [
    {
      __typename: 'PageLayoutTab',
      isSystemSideEffect: false,
      universalIdentifier: 'universal-identifier-mock',
      id: 'tab-1',
      applicationId: 'test-application-id',
      title: 'Tab 1',
      position: 0,
      pageLayoutId: 'page-layout-1',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      widgets,
    },
  ],
});

const dropBindings = (
  widget: PageLayoutWidget,
  filters?: DraftPageLayout['filters'],
) =>
  dropDashboardFilterBindingsToRemovedFilters({
    ...buildDraft([widget]),
    filters,
  }).tabs[0].widgets[0];

describe('dropDashboardFilterBindingsToRemovedFilters', () => {
  it('should drop the bindings of a chart to filters missing from the dashboard', () => {
    const widgetAfterSave = dropBindings(
      createTestWidget({
        configuration: {
          ...TEST_BAR_CHART_CONFIGURATION,
          dashboardFilterBindings: [PERIOD_BINDING, REMOVED_FILTER_BINDING],
        },
      }),
      [PERIOD_FILTER],
    );

    expect(widgetAfterSave.configuration).toMatchObject({
      dashboardFilterBindings: [PERIOD_BINDING],
    });
  });

  it('should drop the bindings of a record table to filters missing from the dashboard', () => {
    const widgetAfterSave = dropBindings(
      createTestWidget({
        type: WidgetType.RECORD_TABLE,
        configuration: {
          __typename: 'RecordTableConfiguration',
          configurationType: WidgetConfigurationType.RECORD_TABLE,
          viewId: null,
          dashboardFilterBindings: [REMOVED_FILTER_BINDING],
        },
      }),
      [PERIOD_FILTER],
    );

    expect(widgetAfterSave.configuration).toMatchObject({
      dashboardFilterBindings: [],
    });
  });

  it('should keep every binding when the filters were not loaded', () => {
    const widget = createTestWidget({
      configuration: {
        ...TEST_BAR_CHART_CONFIGURATION,
        dashboardFilterBindings: [REMOVED_FILTER_BINDING],
      },
    });

    expect(dropBindings(widget)).toBe(widget);
  });

  it('should leave a widget without bindings alone', () => {
    const widget = createTestWidget();

    expect(dropBindings(widget, [PERIOD_FILTER])).toBe(widget);
  });
});
