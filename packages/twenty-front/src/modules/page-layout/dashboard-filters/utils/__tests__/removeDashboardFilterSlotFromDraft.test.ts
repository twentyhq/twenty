import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { removeDashboardFilterSlotFromDraft } from '@/page-layout/dashboard-filters/utils/removeDashboardFilterSlotFromDraft';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { WidgetType } from '~/generated-metadata/graphql';
import {
  TEST_BAR_CHART_CONFIGURATION,
  TEST_FIELD_METADATA_ID_1,
  TEST_FIELD_METADATA_ID_2,
  TEST_IFRAME_CONFIGURATION,
  createTestWidget,
} from '~/testing/mock-data/widget-configurations';

const SLOTS: DashboardFilterSlot[] = [
  { id: 'slot-a', label: 'A', filterType: 'TEXT' },
  { id: 'slot-b', label: 'B', filterType: 'DATE_TIME' },
];

const fullyBoundWidget = createTestWidget({
  id: 'fully-bound-widget',
  type: WidgetType.GRAPH,
  configuration: {
    ...TEST_BAR_CHART_CONFIGURATION,
    dashboardFilterBindings: {
      'slot-a': { fieldMetadataId: TEST_FIELD_METADATA_ID_1 },
      'slot-b': { fieldMetadataId: TEST_FIELD_METADATA_ID_2 },
    },
  },
});

const optedOutWidget = createTestWidget({
  id: 'opted-out-widget',
  type: WidgetType.GRAPH,
  configuration: {
    ...TEST_BAR_CHART_CONFIGURATION,
    dashboardFilterBindings: { 'slot-a': null },
  },
});

const widgetWithoutBindings = createTestWidget({
  id: 'widget-without-bindings',
  type: WidgetType.GRAPH,
  configuration: TEST_BAR_CHART_CONFIGURATION,
});

const iframeWidget = createTestWidget({
  id: 'iframe-widget',
  type: WidgetType.IFRAME,
  configuration: TEST_IFRAME_CONFIGURATION,
});

const buildDraft = (dashboardFilters: DashboardFilterSlot[] | null) => ({
  ...makeDraft([
    makeTab('tab-1', [fullyBoundWidget, optedOutWidget]),
    makeTab('tab-2', [widgetWithoutBindings, iframeWidget]),
  ]),
  dashboardFilters,
});

describe('removeDashboardFilterSlotFromDraft', () => {
  it('removes the slot and sweeps its binding out of every chart widget', () => {
    const nextDraft = removeDashboardFilterSlotFromDraft({
      draft: buildDraft(SLOTS),
      slotId: 'slot-a',
    });

    expect(nextDraft.dashboardFilters).toEqual([SLOTS[1]]);

    const [firstTab, secondTab] = nextDraft.tabs;

    expect(firstTab.widgets[0].configuration).toEqual({
      ...TEST_BAR_CHART_CONFIGURATION,
      dashboardFilterBindings: {
        'slot-b': { fieldMetadataId: TEST_FIELD_METADATA_ID_2 },
      },
    });
    expect(firstTab.widgets[1].configuration).toEqual({
      ...TEST_BAR_CHART_CONFIGURATION,
      dashboardFilterBindings: {},
    });
    expect(secondTab.widgets[0]).toBe(widgetWithoutBindings);
    expect(secondTab.widgets[1]).toBe(iframeWidget);
  });

  it('leaves a draft still on the built-ins untouched apart from the sweep', () => {
    const nextDraft = removeDashboardFilterSlotFromDraft({
      draft: buildDraft(null),
      slotId: 'slot-b',
    });

    expect(nextDraft.dashboardFilters).toBeNull();
    expect(nextDraft.tabs[0].widgets[0].configuration).toEqual({
      ...TEST_BAR_CHART_CONFIGURATION,
      dashboardFilterBindings: {
        'slot-a': { fieldMetadataId: TEST_FIELD_METADATA_ID_1 },
      },
    });
  });
});
