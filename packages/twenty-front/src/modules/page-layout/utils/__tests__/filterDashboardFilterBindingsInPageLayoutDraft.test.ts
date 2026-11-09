import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { filterDashboardFilterBindingsInPageLayoutDraft } from '@/page-layout/utils/filterDashboardFilterBindingsInPageLayoutDraft';
import {
  TEST_BAR_CHART_CONFIGURATION,
  createTestWidget,
} from '~/testing/mock-data/widget-configurations';

const PERIOD_BINDING = {
  pageLayoutFilterId: 'period',
  fieldMetadataId: 'close-date',
};
const SIGNUP_BINDING = { pageLayoutFilterId: 'signup', fieldMetadataId: null };

const chart = createTestWidget({
  configuration: {
    ...TEST_BAR_CHART_CONFIGURATION,
    dashboardFilterBindings: [PERIOD_BINDING, SIGNUP_BINDING],
  },
});

describe('filterDashboardFilterBindingsInPageLayoutDraft', () => {
  it('should keep only the bindings the predicate keeps, with their widget', () => {
    const isBindingKept = jest.fn(
      ({ binding }: { binding: { pageLayoutFilterId: string } }) =>
        binding.pageLayoutFilterId === 'signup',
    );

    const [widget] = filterDashboardFilterBindingsInPageLayoutDraft({
      pageLayoutDraft: makeDraft([makeTab('tab-1', [chart])]),
      isBindingKept,
    }).tabs[0].widgets;

    expect(widget.configuration).toMatchObject({
      dashboardFilterBindings: [SIGNUP_BINDING],
    });
    expect(isBindingKept).toHaveBeenCalledWith({
      binding: PERIOD_BINDING,
      widget: chart,
    });
  });

  it('should return a widget unchanged when every binding is kept', () => {
    const [widget] = filterDashboardFilterBindingsInPageLayoutDraft({
      pageLayoutDraft: makeDraft([makeTab('tab-1', [chart])]),
      isBindingKept: () => true,
    }).tabs[0].widgets;

    expect(widget).toBe(chart);
  });
});
