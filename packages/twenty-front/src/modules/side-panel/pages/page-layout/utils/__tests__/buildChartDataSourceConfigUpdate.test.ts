import { buildChartDataSourceConfigUpdate } from '@/side-panel/pages/page-layout/utils/buildChartDataSourceConfigUpdate';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import {
  AggregateOperations,
  GraphOrderBy,
} from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import {
  TEST_AGGREGATE_CHART_CONFIGURATION,
  TEST_BAR_CHART_CONFIGURATION,
  TEST_FIELD_METADATA_ID_3,
  TEST_PIE_CHART_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

const opportunity = getMockObjectMetadataItemOrThrow('opportunity');
const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const getOpportunityFieldIdOrThrow = (fieldName: string) => {
  const field = opportunity.fields.find((field) => field.name === fieldName);

  if (field === undefined) {
    throw new Error(`Field ${fieldName} not found`);
  }

  return field.id;
};

describe('buildChartDataSourceConfigUpdate', () => {
  it('should pick default fields of the new object for a bar chart and clear its secondary axis', () => {
    expect(
      buildChartDataSourceConfigUpdate({
        configuration: {
          ...TEST_BAR_CHART_CONFIGURATION,
          secondaryAxisGroupByFieldMetadataId: TEST_FIELD_METADATA_ID_3,
        },
        objectMetadataItem: opportunity,
        objectMetadataItems,
      }),
    ).toMatchObject({
      aggregateFieldMetadataId: getOpportunityFieldIdOrThrow('amount'),
      aggregateOperation: AggregateOperations.SUM,
      primaryAxisGroupByFieldMetadataId: getOpportunityFieldIdOrThrow('stage'),
      primaryAxisOrderBy: GraphOrderBy.FIELD_POSITION_ASC,
      secondaryAxisGroupByFieldMetadataId: undefined,
      filter: {},
    });
  });

  it('should pick default fields of the new object for a pie chart', () => {
    const configUpdate = buildChartDataSourceConfigUpdate({
      configuration: TEST_PIE_CHART_CONFIGURATION,
      objectMetadataItem: opportunity,
      objectMetadataItems,
    });

    expect(configUpdate).toMatchObject({
      aggregateFieldMetadataId: getOpportunityFieldIdOrThrow('amount'),
      groupByFieldMetadataId: getOpportunityFieldIdOrThrow('stage'),
      dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
    });
    expect(configUpdate).not.toHaveProperty(
      'primaryAxisGroupByFieldMetadataId',
    );
  });

  it('should pick the default aggregate field of the new object for an aggregate chart', () => {
    const configUpdate = buildChartDataSourceConfigUpdate({
      configuration: {
        ...TEST_AGGREGATE_CHART_CONFIGURATION,
        ratioAggregateConfig: {
          fieldMetadataId: TEST_FIELD_METADATA_ID_3,
          optionValue: 'WON',
        },
      },
      objectMetadataItem: opportunity,
      objectMetadataItems,
    });

    expect(configUpdate).toEqual({
      aggregateFieldMetadataId: getOpportunityFieldIdOrThrow('amount'),
      aggregateOperation: AggregateOperations.SUM,
      filter: {},
      ratioAggregateConfig: undefined,
    });
  });

  it('should leave the required fields unset when the new object has no usable field', () => {
    expect(
      buildChartDataSourceConfigUpdate({
        configuration: TEST_BAR_CHART_CONFIGURATION,
        objectMetadataItem: { ...opportunity, readableFields: [] },
        objectMetadataItems,
      }),
    ).toMatchObject({
      aggregateFieldMetadataId: undefined,
      primaryAxisGroupByFieldMetadataId: undefined,
    });
  });
});
