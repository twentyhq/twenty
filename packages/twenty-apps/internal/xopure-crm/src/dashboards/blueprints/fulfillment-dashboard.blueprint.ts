import type { DashboardBlueprint } from './dashboard-blueprint.type';

export const fulfillmentDashboardBlueprint: DashboardBlueprint = {
  title: 'Fulfillment Dashboard',
  tabs: [
    {
      key: 'fulfillment-dashboard',
      title: 'Fulfillment',
      position: 0,
      widgets: [
        {
          title: 'Fulfillment Status Mix',
          type: 'GRAPH',
          objectNameSingular: 'xopureOrder',
          gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 6 },
          configuration: {
            configurationType: 'PIE_CHART',
            aggregateFieldName: 'id',
            aggregateOperation: 'COUNT',
            groupByFieldName: 'fulfillmentStatus',
            orderBy: 'VALUE_DESC',
            displayDataLabel: true,
          },
        },
        {
          title: 'Paid / Open Readiness',
          type: 'GRAPH',
          objectNameSingular: 'xopureOrder',
          gridPosition: { row: 0, column: 6, rowSpan: 4, columnSpan: 6 },
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
          title: 'Shipped Orders Over Time',
          type: 'GRAPH',
          objectNameSingular: 'xopureOrder',
          gridPosition: { row: 4, column: 0, rowSpan: 4, columnSpan: 12 },
          configuration: {
            configurationType: 'LINE_CHART',
            aggregateFieldName: 'id',
            aggregateOperation: 'COUNT',
            primaryAxisGroupByFieldName: 'shippedAt',
            primaryAxisOrderBy: 'ASC',
            axisNameDisplay: 'Shipped at',
            displayLegend: true,
          },
        },
        {
          title: 'Fulfillment Tracking',
          type: 'RECORD_TABLE',
          objectNameSingular: 'xopureOrder',
          gridPosition: { row: 8, column: 0, rowSpan: 6, columnSpan: 12 },
          view: {
            name: 'Fulfillment Tracking',
            icon: 'IconTruckDelivery',
            fields: [
              { fieldName: 'orderNumber', position: 0, size: 150 },
              { fieldName: 'status', position: 1, size: 120 },
              { fieldName: 'paymentStatus', position: 2, size: 130 },
              { fieldName: 'fulfillmentStatus', position: 3, size: 150 },
              { fieldName: 'trackingNumber', position: 4, size: 160 },
              { fieldName: 'trackingUrl', position: 5, size: 220 },
              { fieldName: 'shippedAt', position: 6, size: 160 },
              { fieldName: 'deliveredAt', position: 7, size: 160 },
              { fieldName: 'orderedAt', position: 8, size: 160 },
            ],
          },
        },
      ],
    },
  ],
};
