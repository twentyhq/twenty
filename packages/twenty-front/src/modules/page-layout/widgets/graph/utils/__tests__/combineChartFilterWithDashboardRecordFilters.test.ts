import { combineChartFilterWithDashboardRecordFilters } from '@/page-layout/widgets/graph/utils/combineChartFilterWithDashboardRecordFilters';
import {
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

const DASHBOARD_RECORD_FILTER = {
  fieldMetadataId: 'close-date-id',
  operand: ViewFilterOperand.IS_AFTER,
  value: '2026-01-01',
};

describe('combineChartFilterWithDashboardRecordFilters', () => {
  it('should leave the chart filter untouched without dashboard filters', () => {
    const chartFilter = {
      recordFilters: [
        {
          fieldMetadataId: 'stage-id',
          operand: ViewFilterOperand.IS,
          value: '["WON"]',
        },
      ],
      recordFilterGroups: [],
    };

    expect(
      combineChartFilterWithDashboardRecordFilters({
        chartFilter,
        dashboardRecordFilters: [],
      }),
    ).toEqual(chartFilter);
  });

  it('should AND the dashboard filters with an OR-rooted chart filter', () => {
    const { recordFilters, recordFilterGroups } =
      combineChartFilterWithDashboardRecordFilters({
        chartFilter: {
          recordFilters: [
            {
              fieldMetadataId: 'stage-id',
              operand: ViewFilterOperand.IS,
              value: '["WON"]',
              recordFilterGroupId: 'chart-root',
            },
          ],
          recordFilterGroups: [
            {
              id: 'chart-root',
              logicalOperator: RecordFilterGroupLogicalOperator.OR,
            },
          ],
        },
        dashboardRecordFilters: [DASHBOARD_RECORD_FILTER],
      });

    const [dashboardRootGroup, chartRootGroup] = recordFilterGroups;

    expect(dashboardRootGroup).toEqual({
      id: expect.any(String),
      logicalOperator: RecordFilterGroupLogicalOperator.AND,
    });
    expect(chartRootGroup).toEqual({
      id: 'chart-root',
      logicalOperator: RecordFilterGroupLogicalOperator.OR,
      parentRecordFilterGroupId: dashboardRootGroup.id,
    });
    expect(recordFilters).toEqual([
      expect.objectContaining({ recordFilterGroupId: 'chart-root' }),
      {
        ...DASHBOARD_RECORD_FILTER,
        recordFilterGroupId: dashboardRootGroup.id,
      },
    ]);
  });

  it('should move ungrouped chart filters under the dashboard root', () => {
    const { recordFilters } = combineChartFilterWithDashboardRecordFilters({
      chartFilter: {
        recordFilters: [
          {
            fieldMetadataId: 'amount-id',
            operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
            value: '1000',
          },
        ],
      },
      dashboardRecordFilters: [DASHBOARD_RECORD_FILTER],
    });

    expect(
      new Set(
        recordFilters.map(({ recordFilterGroupId }) => recordFilterGroupId),
      ).size,
    ).toBe(1);
  });

  it('should keep only the parentless group the chart compiles, with its subtree', () => {
    const condition = (id: string, recordFilterGroupId: string) => ({
      id,
      fieldMetadataId: 'stage-id',
      operand: ViewFilterOperand.IS,
      value: '["WON"]',
      recordFilterGroupId,
    });

    const { recordFilters, recordFilterGroups } =
      combineChartFilterWithDashboardRecordFilters({
        chartFilter: {
          recordFilters: [
            condition('in-root', 'root'),
            condition('in-child', 'child'),
            condition('in-ignored', 'ignored-root'),
            condition('in-ignored-child', 'ignored-child'),
          ],
          recordFilterGroups: [
            {
              id: 'root',
              logicalOperator: RecordFilterGroupLogicalOperator.AND,
            },
            {
              id: 'child',
              logicalOperator: RecordFilterGroupLogicalOperator.OR,
              parentRecordFilterGroupId: 'root',
            },
            {
              id: 'ignored-root',
              logicalOperator: RecordFilterGroupLogicalOperator.AND,
            },
            {
              id: 'ignored-child',
              logicalOperator: RecordFilterGroupLogicalOperator.AND,
              parentRecordFilterGroupId: 'ignored-root',
            },
          ],
        },
        dashboardRecordFilters: [DASHBOARD_RECORD_FILTER],
      });

    expect(recordFilterGroups.map(({ id }) => id)).toEqual([
      expect.any(String),
      'root',
      'child',
    ]);
    expect(
      recordFilters.map(({ id }) => id).filter((id) => id !== undefined),
    ).toEqual(['in-root', 'in-child']);
  });
});
