import type { DashboardBlueprint } from './dashboard-blueprint.type';

export const ordersDashboardBlueprint: DashboardBlueprint = {
  title: 'Orders Dashboard',
  tabs: [
    {
      key: 'orders-dashboard',
      title: 'Orders',
      position: 0,
      widgets: [
        {
          title: 'Total Orders',
          type: 'GRAPH',
          objectNameSingular: 'xopureOrder',
          gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldName: 'id',
            aggregateOperation: 'COUNT',
            label: 'Orders',
            displayDataLabel: true,
          },
        },
        {
          title: 'Total Revenue',
          type: 'GRAPH',
          objectNameSingular: 'xopureOrder',
          gridPosition: { row: 0, column: 3, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldName: 'totalCents',
            aggregateOperation: 'SUM',
            label: 'Revenue',
            suffix: 'c',
            displayDataLabel: true,
          },
        },
        {
          title: 'Order Status Mix',
          type: 'GRAPH',
          objectNameSingular: 'xopureOrder',
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
          title: 'Orders Over Time',
          type: 'GRAPH',
          objectNameSingular: 'xopureOrder',
          gridPosition: { row: 2, column: 6, rowSpan: 4, columnSpan: 6 },
          configuration: {
            configurationType: 'LINE_CHART',
            aggregateFieldName: 'id',
            aggregateOperation: 'COUNT',
            primaryAxisGroupByFieldName: 'orderedAt',
            primaryAxisOrderBy: 'ASC',
            axisNameDisplay: 'Ordered at',
            displayLegend: true,
          },
        },
        {
          title: 'Recent / Refunded / Cancelled / Manual Review Orders',
          type: 'RECORD_TABLE',
          objectNameSingular: 'xopureOrder',
          gridPosition: { row: 6, column: 0, rowSpan: 6, columnSpan: 12 },
          view: {
            name: 'Orders Review',
            icon: 'IconShoppingBag',
            fields: [
              { fieldName: 'orderNumber', position: 0, size: 150 },
              { fieldName: 'customerEmail', position: 1, size: 220 },
              { fieldName: 'status', position: 2, size: 120 },
              { fieldName: 'paymentStatus', position: 3, size: 130 },
              { fieldName: 'fulfillmentStatus', position: 4, size: 150 },
              { fieldName: 'totalCents', position: 5, size: 110 },
              { fieldName: 'manualReviewRequired', position: 6, size: 170 },
              { fieldName: 'orderedAt', position: 7, size: 160 },
            ],
          },
        },
      ],
    },
  ],
};
