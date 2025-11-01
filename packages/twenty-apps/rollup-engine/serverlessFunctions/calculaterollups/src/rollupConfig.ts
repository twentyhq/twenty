import type { RollupConfig } from './types';

export const defaultRollupConfig: RollupConfig = [
  {
    parentObject: 'company',
    childObject: 'opportunity',
    relationField: 'companyId',
    childFilters: [
      {
        field: 'amount.amountMicros',
        operator: 'gt',
        value: 0,
      },
    ],
    aggregations: [
      {
        type: 'SUM',
        childField: 'amount.amountMicros',
        parentField: 'totalPipelineAmount',
        currencyField: 'amount.currencyCode',
      },
      {
        type: 'COUNT',
        parentField: 'totalOpportunityCount',
      },
      {
        type: 'SUM',
        childField: 'amount.amountMicros',
        parentField: 'wonPipelineAmount',
        currencyField: 'amount.currencyCode',
        filters: [
          {
            field: 'stage',
            operator: 'equals',
            value: 'CUSTOMER',
          },
        ],
      },
      {
        type: 'COUNT',
        parentField: 'wonOpportunityCount',
        filters: [
          {
            field: 'stage',
            operator: 'equals',
            value: 'CUSTOMER',
          },
        ],
      },
      {
        type: 'SUM',
        childField: 'amount.amountMicros',
        parentField: 'openPipelineAmount',
        currencyField: 'amount.currencyCode',
        filters: [
          {
            field: 'stage',
            operator: 'notEquals',
            value: 'CUSTOMER',
          },
        ],
      },
      {
        type: 'COUNT',
        parentField: 'openOpportunityCount',
        filters: [
          {
            field: 'stage',
            operator: 'notEquals',
            value: 'CUSTOMER',
          },
        ],
      },
      {
        type: 'MAX',
        childField: 'closeDate',
        parentField: 'lastOpportunityCloseDate',
      },
    ],
  },
];
