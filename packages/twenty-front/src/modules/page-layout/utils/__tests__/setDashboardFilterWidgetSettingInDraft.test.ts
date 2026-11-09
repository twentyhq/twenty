import { DASHBOARD_FILTER_NOT_APPLIED_OPTION_VALUE } from '@/page-layout/constants/DashboardFilterNotAppliedOptionValue';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { setDashboardFilterWidgetSettingInDraft } from '@/page-layout/utils/setDashboardFilterWidgetSettingInDraft';
import {
  TEST_BAR_CHART_CONFIGURATION,
  createTestWidget,
} from '~/testing/mock-data/widget-configurations';

describe('setDashboardFilterWidgetSettingInDraft', () => {
  it('should write the setting into the bindings of that widget only', () => {
    const editedWidget = createTestWidget({ id: 'edited-widget' });
    const otherWidget = createTestWidget({ id: 'other-widget' });

    const pageLayoutDraft = setDashboardFilterWidgetSettingInDraft({
      pageLayoutDraft: makeDraft([
        makeTab('tab-1', [editedWidget]),
        makeTab('tab-2', [otherWidget]),
      ]),
      widgetId: 'edited-widget',
      pageLayoutFilterId: 'period-filter',
      value: DASHBOARD_FILTER_NOT_APPLIED_OPTION_VALUE,
    });

    expect(pageLayoutDraft.tabs[0].widgets[0].configuration).toEqual({
      ...TEST_BAR_CHART_CONFIGURATION,
      dashboardFilterBindings: [
        { pageLayoutFilterId: 'period-filter', fieldMetadataId: null },
      ],
    });
    expect(pageLayoutDraft.tabs[1].widgets[0]).toBe(otherWidget);
  });
});
