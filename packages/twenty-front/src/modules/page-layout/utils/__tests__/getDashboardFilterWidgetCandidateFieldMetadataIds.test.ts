import { getDashboardFilterWidgetCandidateFieldMetadataIds } from '@/page-layout/utils/getDashboardFilterWidgetCandidateFieldMetadataIds';
import { ViewFilterOperand } from 'twenty-shared/types';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';
import {
  TEST_AGGREGATE_CHART_CONFIGURATION,
  TEST_BAR_CHART_CONFIGURATION,
  TEST_FIELD_METADATA_ID_2,
  TEST_FIELD_METADATA_ID_3,
  TEST_IFRAME_CONFIGURATION,
  TEST_PIE_CHART_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

const CHART_FILTER = {
  recordFilters: [
    {
      fieldMetadataId: TEST_FIELD_METADATA_ID_3,
      operand: ViewFilterOperand.IS_AFTER,
      value: '2026-01-01',
    },
  ],
};

describe('getDashboardFilterWidgetCandidateFieldMetadataIds', () => {
  it('should use the primary axis and the filter of a bar chart', () => {
    expect(
      getDashboardFilterWidgetCandidateFieldMetadataIds({
        configuration: {
          ...TEST_BAR_CHART_CONFIGURATION,
          filter: CHART_FILTER,
        },
        viewFilterFieldMetadataIds: ['ignored'],
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
        viewFilterFieldMetadataIds: [],
      }).groupByFieldMetadataIds,
    ).toEqual([TEST_PIE_CHART_CONFIGURATION.groupByFieldMetadataId]);
  });

  it('should only use the filter of an aggregate chart', () => {
    expect(
      getDashboardFilterWidgetCandidateFieldMetadataIds({
        configuration: {
          ...TEST_AGGREGATE_CHART_CONFIGURATION,
          filter: CHART_FILTER,
        },
        viewFilterFieldMetadataIds: [],
      }),
    ).toEqual({
      groupByFieldMetadataIds: [],
      widgetFilterFieldMetadataIds: [TEST_FIELD_METADATA_ID_3],
    });
  });

  it('should use the view filters of a record table', () => {
    expect(
      getDashboardFilterWidgetCandidateFieldMetadataIds({
        configuration: {
          __typename: 'RecordTableConfiguration',
          configurationType: WidgetConfigurationType.RECORD_TABLE,
          viewId: 'view-1',
        },
        viewFilterFieldMetadataIds: [TEST_FIELD_METADATA_ID_3],
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
        viewFilterFieldMetadataIds: [TEST_FIELD_METADATA_ID_3],
      }),
    ).toEqual({
      groupByFieldMetadataIds: [],
      widgetFilterFieldMetadataIds: [],
    });
  });
});
