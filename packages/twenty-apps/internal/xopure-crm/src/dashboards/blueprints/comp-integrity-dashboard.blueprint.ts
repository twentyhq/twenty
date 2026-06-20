import type { DashboardBlueprint } from './dashboard-blueprint.type';

export const compIntegrityDashboardBlueprint: DashboardBlueprint = {
  title: 'Comp Integrity Dashboard',
  tabs: [
    {
      key: 'comp-integrity',
      title: 'Comp Integrity',
      position: 0,
      widgets: [
        {
          title: 'Total Commission Amount',
          type: 'GRAPH',
          objectNameSingular: 'xopureCommission',
          gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldName: 'amountCents',
            aggregateOperation: 'SUM',
            label: 'Amount',
            suffix: 'c',
            displayDataLabel: true,
          },
        },
        {
          title: 'Commission Count',
          type: 'GRAPH',
          objectNameSingular: 'xopureCommission',
          gridPosition: { row: 0, column: 3, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldName: 'id',
            aggregateOperation: 'COUNT',
            label: 'Commissions',
            displayDataLabel: true,
          },
        },
        {
          title: 'Commissions by Status',
          type: 'GRAPH',
          objectNameSingular: 'xopureCommission',
          gridPosition: { row: 2, column: 0, rowSpan: 4, columnSpan: 6 },
          configuration: {
            configurationType: 'PIE_CHART',
            aggregateFieldName: 'id',
            aggregateOperation: 'COUNT',
            groupByFieldName: 'status',
            orderBy: 'VALUE_DESC',
            displayDataLabel: true,
          },
        },
        {
          title: 'Commissions by Pay Area',
          type: 'GRAPH',
          objectNameSingular: 'xopureCommission',
          gridPosition: { row: 2, column: 6, rowSpan: 4, columnSpan: 6 },
          configuration: {
            configurationType: 'PIE_CHART',
            aggregateFieldName: 'id',
            aggregateOperation: 'COUNT',
            groupByFieldName: 'payArea',
            orderBy: 'VALUE_DESC',
            displayDataLabel: true,
          },
        },
        {
          title: 'Comp Integrity Commissions',
          type: 'RECORD_TABLE',
          objectNameSingular: 'xopureCommission',
          gridPosition: { row: 6, column: 0, rowSpan: 6, columnSpan: 12 },
          view: {
            name: 'Comp Integrity Commissions',
            icon: 'IconReceiptDollar',
            fields: [
              { fieldName: 'name', position: 0, size: 180 },
              { fieldName: 'status', position: 1, size: 120 },
              { fieldName: 'amountCents', position: 2, size: 120 },
              { fieldName: 'rate', position: 3, size: 100 },
              { fieldName: 'holdUntil', position: 4, size: 160 },
              { fieldName: 'orderExternalId', position: 5, size: 180 },
              { fieldName: 'ambassadorExternalId', position: 6, size: 180 },
              { fieldName: 'lastSyncedAt', position: 7, size: 160 },
            ],
          },
        },
        {
          title: 'Commission Orders',
          type: 'RECORD_TABLE',
          objectNameSingular: 'xopureOrder',
          gridPosition: { row: 12, column: 0, rowSpan: 6, columnSpan: 12 },
          view: {
            name: 'Commission Orders',
            icon: 'IconShoppingBag',
            fields: [
              { fieldName: 'orderNumber', position: 0, size: 150 },
              { fieldName: 'status', position: 1, size: 120 },
              { fieldName: 'paymentStatus', position: 2, size: 130 },
              { fieldName: 'totalCents', position: 3, size: 120 },
              { fieldName: 'cvAmount', position: 4, size: 120 },
              { fieldName: 'lastSyncedAt', position: 5, size: 160 },
            ],
          },
        },
      ],
    },
  ],
};
