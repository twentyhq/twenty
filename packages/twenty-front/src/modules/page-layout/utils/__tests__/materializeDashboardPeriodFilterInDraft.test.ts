import { DASHBOARD_PERIOD_FILTER_ID } from '@/page-layout/constants/DashboardPeriodFilterId';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { materializeDashboardPeriodFilterInDraft } from '@/page-layout/utils/materializeDashboardPeriodFilterInDraft';
import { PageLayoutFilterType } from '~/generated-metadata/graphql';
import {
  TEST_BAR_CHART_CONFIGURATION,
  createTestWidget,
} from '~/testing/mock-data/widget-configurations';

const PERIOD_FILTER = {
  id: DASHBOARD_PERIOD_FILTER_ID,
  label: 'Period',
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

describe('materializeDashboardPeriodFilterInDraft', () => {
  it('should add the built-in Period when a widget binds it', () => {
    expect(
      materializeDashboardPeriodFilterInDraft(
        buildDraftWithBindings([DASHBOARD_PERIOD_FILTER_ID]),
      ).filters,
    ).toEqual([PERIOD_FILTER]);
  });

  it('should leave a draft without a binding to the built-in Period alone', () => {
    const pageLayoutDraft = buildDraftWithBindings([]);

    expect(materializeDashboardPeriodFilterInDraft(pageLayoutDraft)).toBe(
      pageLayoutDraft,
    );
  });

  it('should keep a built-in Period that is already in the draft', () => {
    const pageLayoutDraft = {
      ...buildDraftWithBindings([DASHBOARD_PERIOD_FILTER_ID]),
      filters: [{ ...PERIOD_FILTER, defaultValue: null }],
    };

    expect(materializeDashboardPeriodFilterInDraft(pageLayoutDraft)).toBe(
      pageLayoutDraft,
    );
  });
});
