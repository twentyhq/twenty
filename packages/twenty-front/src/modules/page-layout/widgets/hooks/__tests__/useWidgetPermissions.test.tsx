import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { getDefaultObjectPermissions } from '@/object-metadata/utils/getDefaultObjectPermissions';
import { NO_WIDGET_DASHBOARD_FILTER } from '@/page-layout/constants/NoWidgetDashboardFilter';
import { WidgetDashboardFilterContext } from '@/page-layout/contexts/WidgetDashboardFilterContext';
import { makeWidget } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useWidgetPermissions } from '@/page-layout/widgets/hooks/useWidgetPermissions';
import { ViewFilterOperand } from 'twenty-shared/types';
import {
  AggregateOperations,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');
const field = (fieldName: string) =>
  getMockFieldMetadataItemOrThrow({
    objectMetadataItem: opportunityObjectMetadataItem,
    fieldName,
  });
const closeDateField = field('closeDate');

const mockUseObjectPermissions = jest.fn();

jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => mockUseObjectPermissions(),
}));

const TILE_WITH_ITS_OWN_PERIOD: PageLayoutWidget = {
  ...makeWidget('tile', 0),
  objectMetadataId: opportunityObjectMetadataItem.id,
  type: WidgetType.GRAPH,
  configuration: {
    __typename: 'AggregateChartConfiguration' as const,
    configurationType: WidgetConfigurationType.AGGREGATE_CHART,
    aggregateFieldMetadataId: field('id').id,
    aggregateOperation: AggregateOperations.COUNT,
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
  },
};

const Wrapper = getJestMetadataAndApolloMocksWrapper({});

describe('useWidgetPermissions', () => {
  it('should count the field the Date range replaces a period on as read', () => {
    mockUseObjectPermissions.mockReturnValue({
      objectPermissionsByObjectMetadataId: {
        [opportunityObjectMetadataItem.id]: {
          ...getDefaultObjectPermissions(),
          canReadObjectRecords: true,
          restrictedFields: {
            [closeDateField.id]: { canRead: false, canUpdate: false },
          },
        },
      },
    });

    const { result } = renderHook(
      () => useWidgetPermissions(TILE_WITH_ITS_OWN_PERIOD),
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
                replacedWidgetRecordFilterIds: ['this-quarter'],
              }}
            >
              {children}
            </WidgetDashboardFilterContext.Provider>
          </Wrapper>
        ),
      },
    );

    expect(result.current).toEqual({
      hasAccess: false,
      restriction: {
        type: 'field',
        objectName: opportunityObjectMetadataItem.labelSingular,
        fieldNames: [closeDateField.label],
      },
    });
  });
});
