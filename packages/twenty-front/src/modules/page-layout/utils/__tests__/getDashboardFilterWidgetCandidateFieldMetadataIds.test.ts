import { getDashboardFilterWidgetCandidateFieldMetadataIds } from '@/page-layout/utils/getDashboardFilterWidgetCandidateFieldMetadataIds';
import { ViewFilterOperand } from 'twenty-shared/types';
import {
  TEST_AGGREGATE_CHART_CONFIGURATION,
  TEST_BAR_CHART_CONFIGURATION,
  TEST_FIELD_METADATA_ID_2,
  TEST_FIELD_METADATA_ID_3,
  TEST_IFRAME_CONFIGURATION,
  TEST_PIE_CHART_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

const NO_FILTER = { recordFilters: [], recordFilterGroups: [] };

const WIDGET_FILTER = {
  recordFilterGroups: [],
  recordFilters: [
    {
      fieldMetadataId: TEST_FIELD_METADATA_ID_3,
      operand: ViewFilterOperand.IS_AFTER,
      value: '2026-01-01',
    },
  ],
};

describe('getDashboardFilterWidgetCandidateFieldMetadataIds', () => {
  it('should use the primary axis and the own filter of a bar chart', () => {
    expect(
      getDashboardFilterWidgetCandidateFieldMetadataIds({
        configuration: TEST_BAR_CHART_CONFIGURATION,
        widgetFilter: WIDGET_FILTER,
      }),
    ).toEqual({
      groupByFieldMetadataIds: [TEST_FIELD_METADATA_ID_2],
      widgetFilterFieldMetadataIds: [TEST_FIELD_METADATA_ID_3],
    });
  });

  it('should use the group-by of a pie chart', () => {
    expect(
      getDashboardFilterWidgetCandidateFieldMetadataIds({
        configuration: TEST_PIE_CHART_CONFIGURATION,
        widgetFilter: NO_FILTER,
      }).groupByFieldMetadataIds,
    ).toEqual([TEST_PIE_CHART_CONFIGURATION.groupByFieldMetadataId]);
  });

  it('should only use the filter of an aggregate chart', () => {
    expect(
      getDashboardFilterWidgetCandidateFieldMetadataIds({
        configuration: TEST_AGGREGATE_CHART_CONFIGURATION,
        widgetFilter: WIDGET_FILTER,
      }),
    ).toEqual({
      groupByFieldMetadataIds: [],
      widgetFilterFieldMetadataIds: [TEST_FIELD_METADATA_ID_3],
    });
  });

  it('should use the own filter of a record table', () => {
    expect(
      getDashboardFilterWidgetCandidateFieldMetadataIds({
        configuration: { __typename: 'RecordTableConfiguration' },
        widgetFilter: WIDGET_FILTER,
      }),
    ).toEqual({
      groupByFieldMetadataIds: [],
      widgetFilterFieldMetadataIds: [TEST_FIELD_METADATA_ID_3],
    });
  });

  it('should return no candidates for a widget without data', () => {
    expect(
      getDashboardFilterWidgetCandidateFieldMetadataIds({
        configuration: TEST_IFRAME_CONFIGURATION,
        widgetFilter: WIDGET_FILTER,
      }),
    ).toEqual({
      groupByFieldMetadataIds: [],
      widgetFilterFieldMetadataIds: [],
    });
  });
});
