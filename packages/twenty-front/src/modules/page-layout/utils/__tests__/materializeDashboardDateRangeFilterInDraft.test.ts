import { DASHBOARD_DATE_RANGE_FILTER_ID } from '@/page-layout/constants/DashboardDateRangeFilterId';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { materializeDashboardDateRangeFilterInDraft } from '@/page-layout/utils/materializeDashboardDateRangeFilterInDraft';
import { PageLayoutFilterType } from '~/generated-metadata/graphql';
import {
  TEST_BAR_CHART_CONFIGURATION,
  createTestWidget,
} from '~/testing/mock-data/widget-configurations';

const DATE_RANGE_FILTER = {
  id: DASHBOARD_DATE_RANGE_FILTER_ID,
  label: 'Date range',
  type: PageLayoutFilterType.DATE,
  position: 0,
  defaultValue: null,
};

const buildDraftWithBindings = (pageLayoutFilterIds: string[]) =>
  makeDraft([
    makeTab('tab-1', [
      createTestWidget({
        configuration: {
          ...TEST_BAR_CHART_CONFIGURATION,
          dashboardFilterBindings: pageLayoutFilterIds.map(
            (pageLayoutFilterId) => ({
              pageLayoutFilterId,
              fieldMetadataId: null,
            }),
          ),
        },
      }),
    ]),
  ]);

describe('materializeDashboardDateRangeFilterInDraft', () => {
  it('should add the built-in Date range when a widget binds it', () => {
    expect(
      materializeDashboardDateRangeFilterInDraft(
        buildDraftWithBindings([DASHBOARD_DATE_RANGE_FILTER_ID]),
      ).filters,
    ).toEqual([DATE_RANGE_FILTER]);
  });

  it('should leave a draft without a binding to the built-in Date range alone', () => {
    const pageLayoutDraft = buildDraftWithBindings([]);

    expect(materializeDashboardDateRangeFilterInDraft(pageLayoutDraft)).toBe(
      pageLayoutDraft,
    );
  });

  it('should keep a built-in Date range that is already in the draft', () => {
    const pageLayoutDraft = {
      ...buildDraftWithBindings([DASHBOARD_DATE_RANGE_FILTER_ID]),
      filters: [{ ...DATE_RANGE_FILTER, defaultValue: null }],
    };

    expect(materializeDashboardDateRangeFilterInDraft(pageLayoutDraft)).toBe(
      pageLayoutDraft,
    );
  });
});
