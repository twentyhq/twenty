import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { removePageLayoutFilterFromDraft } from '@/page-layout/utils/removePageLayoutFilterFromDraft';
import {
  type DashboardFilterBinding,
  type PageLayoutFilter,
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

const buildFilter = (id: string, label: string): PageLayoutFilter => ({
  id,
  label,
  type: PageLayoutFilterType.DATE,
  position: 0,
  defaultValue: null,
});

const PERIOD_FILTER = buildFilter('filter-period', 'Period');
const SIGNUP_FILTER = buildFilter('filter-signup', 'Signup');

const PERIOD_BINDING: DashboardFilterBinding = {
  pageLayoutFilterId: PERIOD_FILTER.id,
  fieldMetadataId: TEST_FIELD_METADATA_ID_1,
};

const SIGNUP_BINDING: DashboardFilterBinding = {
  pageLayoutFilterId: SIGNUP_FILTER.id,
  fieldMetadataId: TEST_FIELD_METADATA_ID_1,
};

const buildTab = (
  id: string,
  widgets: DraftPageLayout['tabs'][number]['widgets'],
): DraftPageLayout['tabs'][number] => ({
  __typename: 'PageLayoutTab',
  id,
  applicationId: 'workspace-custom-application-id',
  universalIdentifier: id,
  isSystemSideEffect: false,
  title: id,
  position: 0,
  pageLayoutId: 'page-layout-1',
  isActive: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  widgets,
});

describe('removePageLayoutFilterFromDraft', () => {
  const chartBoundToBothFilters = createTestWidget({
    id: 'chart',
    configuration: {
      ...TEST_BAR_CHART_CONFIGURATION,
      dashboardFilterBindings: [PERIOD_BINDING, SIGNUP_BINDING],
    },
  });

  const tableBoundToPeriod = createTestWidget({
    id: 'table',
    type: WidgetType.RECORD_TABLE,
    configuration: {
      __typename: 'RecordTableConfiguration',
      configurationType: WidgetConfigurationType.RECORD_TABLE,
      dashboardFilterBindings: [PERIOD_BINDING],
    },
  });

  const unboundChart = createTestWidget({ id: 'unbound-chart' });

  const pageLayoutDraft: DraftPageLayout = {
    id: 'page-layout-1',
    name: 'Sales',
    type: PageLayoutType.DASHBOARD,
    isFirstTabPinned: false,
    objectMetadataId: null,
    defaultTabToFocusOnMobileAndSidePanelId: null,
    filters: [PERIOD_FILTER, SIGNUP_FILTER],
    tabs: [
      buildTab('tab-1', [chartBoundToBothFilters, unboundChart]),
      buildTab('tab-2', [tableBoundToPeriod]),
    ],
  };

  const result = removePageLayoutFilterFromDraft({
    pageLayoutDraft,
    pageLayoutFilterId: PERIOD_FILTER.id,
  });

  it('should remove the filter from the draft', () => {
    expect(result.filters).toEqual([SIGNUP_FILTER]);
  });

  it('should drop the bindings to the removed filter on every tab', () => {
    expect(result.tabs[0].widgets[0].configuration).toMatchObject({
      dashboardFilterBindings: [SIGNUP_BINDING],
    });
    expect(result.tabs[1].widgets[0].configuration).toMatchObject({
      dashboardFilterBindings: [],
    });
  });

  it('should leave widgets without bindings to the removed filter alone', () => {
    expect(result.tabs[0].widgets[1]).toBe(unboundChart);
  });
});
