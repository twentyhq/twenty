import type { DashboardBlueprint } from './dashboard-blueprint.type';

export const paymentsDashboardBlueprint: DashboardBlueprint = {
  title: 'Payments Dashboard',
  tabs: [
    {
      key: 'payments-dashboard',
      title: 'Payments',
      position: 0,
      widgets: [
        {
          title: 'Payment Count',
          type: 'GRAPH',
          objectNameSingular: 'xopurePayment',
          gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldName: 'id',
            aggregateOperation: 'COUNT',
            label: 'Payments',
            displayDataLabel: true,
          },
        },
        {
          title: 'Successful Payment Amount',
          type: 'GRAPH',
          objectNameSingular: 'xopurePayment',
          gridPosition: { row: 0, column: 3, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldName: 'amount',
            aggregateOperation: 'SUM',
            label: 'Successful payment amount',
            filter: {
              status: { in: ['SUCCEEDED'] },
            },
            displayDataLabel: true,
          },
        },
        {
          title: 'Refund Amount',
          type: 'GRAPH',
          objectNameSingular: 'xopurePayment',
          gridPosition: { row: 0, column: 6, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldName: 'refundAmount',
            aggregateOperation: 'SUM',
            label: 'Refund amount',
            filter: {
              status: { in: ['REFUNDED', 'PARTIALLY_REFUNDED'] },
            },
            displayDataLabel: true,
          },
        },
        {
          title: 'Payment Status Mix',
          type: 'GRAPH',
          objectNameSingular: 'xopurePayment',
          gridPosition: { row: 2, column: 0, rowSpan: 4, columnSpan: 4 },
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
          title: 'Payment Provider Mix',
          type: 'GRAPH',
          objectNameSingular: 'xopurePayment',
          gridPosition: { row: 2, column: 4, rowSpan: 4, columnSpan: 4 },
          configuration: {
            configurationType: 'PIE_CHART',
            aggregateFieldName: 'id',
            aggregateOperation: 'COUNT',
            groupByFieldName: 'provider',
            orderBy: 'VALUE_DESC',
            displayDataLabel: true,
          },
        },
        {
          title: 'Payment Rail Mix',
          type: 'GRAPH',
          objectNameSingular: 'xopurePayment',
          gridPosition: { row: 2, column: 8, rowSpan: 4, columnSpan: 4 },
          configuration: {
            configurationType: 'PIE_CHART',
            aggregateFieldName: 'id',
            aggregateOperation: 'COUNT',
            groupByFieldName: 'rail',
            orderBy: 'VALUE_DESC',
            displayDataLabel: true,
          },
        },
        {
          title: 'Payment Exceptions',
          type: 'RECORD_TABLE',
          objectNameSingular: 'xopurePayment',
          gridPosition: { row: 6, column: 0, rowSpan: 6, columnSpan: 12 },
          view: {
            name: 'Payment Exceptions',
            icon: 'IconAlertTriangle',
            fields: [
              { fieldName: 'name', position: 0, size: 180 },
              { fieldName: 'status', position: 1, size: 130 },
              { fieldName: 'provider', position: 2, size: 120 },
              { fieldName: 'rail', position: 3, size: 120 },
              { fieldName: 'amount', position: 4, size: 120 },
              { fieldName: 'refundAmount', position: 5, size: 120 },
              { fieldName: 'description', position: 6, size: 220 },
              { fieldName: 'lastSyncedAt', position: 7, size: 160 },
            ],
          },
        },
      ],
    },
  ],
};
