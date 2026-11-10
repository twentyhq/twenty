import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { findChartWidgetsMissingRequiredFields } from '@/page-layout/utils/findChartWidgetsMissingRequiredFields';
import { WidgetType } from '~/generated-metadata/graphql';
import {
  TEST_AGGREGATE_CHART_CONFIGURATION,
  TEST_PIE_CHART_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

const makeChartWidget = (
  id: string,
  configuration: PageLayoutWidget['configuration'],
): PageLayoutWidget => ({
  ...makeWidget(id, 0),
  type: WidgetType.GRAPH,
  configuration,
});

describe('findChartWidgetsMissingRequiredFields', () => {
  it('should return the charts whose required fields are unset or empty', () => {
    const draft = makeDraft([
      makeTab('tab-1', [
        makeChartWidget('complete-chart', TEST_PIE_CHART_CONFIGURATION),
        makeChartWidget('chart-without-group-by', {
          ...TEST_PIE_CHART_CONFIGURATION,
          groupByFieldMetadataId: '',
        }),
        makeWidget('fields-widget', 1),
      ]),
    ]);

    expect(
      findChartWidgetsMissingRequiredFields({
        pageLayoutDraft: draft,
        persistedPageLayout: undefined,
      }).map((widget) => widget.id),
    ).toEqual(['chart-without-group-by']);
  });

  it('should ignore charts on removed tabs', () => {
    const draft = makeDraft([
      makeTab(
        'removed-tab',
        [
          makeChartWidget('chart-without-aggregate', {
            ...TEST_AGGREGATE_CHART_CONFIGURATION,
            aggregateFieldMetadataId: '',
          }),
        ],
        0,
        undefined,
        { isActive: false },
      ),
    ]);

    expect(
      findChartWidgetsMissingRequiredFields({
        pageLayoutDraft: draft,
        persistedPageLayout: undefined,
      }),
    ).toEqual([]);
  });

  it('should ignore an incomplete chart left as it was saved, and flag it once edited', () => {
    const savedIncompleteChart = makeChartWidget('saved-chart', {
      ...TEST_PIE_CHART_CONFIGURATION,
      groupByFieldMetadataId: '',
    });
    const persistedPageLayout = makeDraft([
      makeTab('tab-1', [savedIncompleteChart]),
    ]);

    expect(
      findChartWidgetsMissingRequiredFields({
        pageLayoutDraft: makeDraft([makeTab('tab-1', [savedIncompleteChart])]),
        persistedPageLayout,
      }),
    ).toEqual([]);

    const editedChart = makeChartWidget('saved-chart', {
      ...TEST_PIE_CHART_CONFIGURATION,
      groupByFieldMetadataId: '',
      displayDataLabel: false,
    });

    expect(
      findChartWidgetsMissingRequiredFields({
        pageLayoutDraft: makeDraft([makeTab('tab-1', [editedChart])]),
        persistedPageLayout,
      }).map((widget) => widget.id),
    ).toEqual(['saved-chart']);
  });
});
