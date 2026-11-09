import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { NO_WIDGET_DASHBOARD_FILTER } from '@/page-layout/constants/NoWidgetDashboardFilter';
import { WidgetDashboardFilterContext } from '@/page-layout/contexts/WidgetDashboardFilterContext';
import { useGraphWidgetAggregateQuery } from '@/page-layout/widgets/graph/hooks/useGraphWidgetAggregateQuery';
import { ViewFilterOperand } from 'twenty-shared/types';
import {
  AggregateOperations,
  type AggregateChartConfiguration,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockUseAggregateRecords = jest.fn();

jest.mock('@/object-record/hooks/useAggregateRecords', () => ({
  useAggregateRecords: (args: unknown) => mockUseAggregateRecords(args),
}));

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');
const field = (fieldName: string) =>
  getMockFieldMetadataItemOrThrow({
    objectMetadataItem: opportunityObjectMetadataItem,
    fieldName,
  });
const closeDateField = field('closeDate');
const stageField = field('stage');

const DASHBOARD_GQL_OPERATION_FILTER = {
  closeDate: { gte: '2026-08-14T00:00:00Z' },
};

const CONFIGURATION: AggregateChartConfiguration = {
  __typename: 'AggregateChartConfiguration',
  configurationType: WidgetConfigurationType.AGGREGATE_CHART,
  aggregateFieldMetadataId: field('id').id,
  aggregateOperation: AggregateOperations.COUNT,
  ratioAggregateConfig: {
    fieldMetadataId: stageField.id,
    optionValue: 'CUSTOMER',
  },
  filter: {
    recordFilters: [
      {
        id: 'this-quarter',
        fieldMetadataId: closeDateField.id,
        operand: ViewFilterOperand.IS_RELATIVE,
        value: 'THIS_1_QUARTER',
      },
    ],
    recordFilterGroups: [],
  },
};

const Wrapper = getJestMetadataAndApolloMocksWrapper({});

describe('useGraphWidgetAggregateQuery', () => {
  it("should give both ratio queries the dashboard filter in place of the widget's own period", () => {
    mockUseAggregateRecords.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });

    renderHook(
      () =>
        useGraphWidgetAggregateQuery({
          objectMetadataItemId: opportunityObjectMetadataItem.id,
          configuration: CONFIGURATION,
        }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <Wrapper>
            <WidgetDashboardFilterContext.Provider
              value={{
                ...NO_WIDGET_DASHBOARD_FILTER,
                appliedFields: [
                  {
                    pageLayoutFilterId: 'date-range',
                    fieldMetadataId: closeDateField.id,
                    source: 'WIDGET_FILTER',
                  },
                ],
                gqlOperationFilter: DASHBOARD_GQL_OPERATION_FILTER,
              }}
            >
              {children}
            </WidgetDashboardFilterContext.Provider>
          </Wrapper>
        ),
      },
    );

    const ratioQueryFilters = mockUseAggregateRecords.mock.calls
      .map(([args]) => args)
      .filter(({ skip }) => !skip)
      .map(({ filter }) => filter);

    expect(ratioQueryFilters.slice(-2)).toEqual([
      { and: [DASHBOARD_GQL_OPERATION_FILTER, { stage: { eq: 'CUSTOMER' } }] },
      DASHBOARD_GQL_OPERATION_FILTER,
    ]);
  });
});
