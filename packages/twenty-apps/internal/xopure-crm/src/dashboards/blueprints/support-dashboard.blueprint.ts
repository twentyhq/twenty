import type { DashboardBlueprint } from './dashboard-blueprint.type';

export const supportDashboardBlueprint: DashboardBlueprint = {
  title: 'Support Dashboard',
  tabs: [
    {
      key: 'support',
      title: 'Support',
      position: 0,
      widgets: [
        {
          title: 'Total Tickets',
          type: 'GRAPH',
          objectNameSingular: 'xopureSupportTicket',
          gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldName: 'id',
            aggregateOperation: 'COUNT',
            label: 'Tickets',
            displayDataLabel: true,
          },
        },
        {
          title: 'Open Tickets',
          type: 'GRAPH',
          objectNameSingular: 'xopureSupportTicket',
          gridPosition: { row: 0, column: 3, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldName: 'id',
            aggregateOperation: 'COUNT',
            label: 'Open',
            displayDataLabel: true,
            filter: {
              status: { notIn: ['CLOSED', 'RESOLVED'] },
            },
          },
        },
        {
          title: 'Ticket Status Mix',
          type: 'GRAPH',
          objectNameSingular: 'xopureSupportTicket',
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
          title: 'Ticket Priority Mix',
          type: 'GRAPH',
          objectNameSingular: 'xopureSupportTicket',
          gridPosition: { row: 2, column: 6, rowSpan: 4, columnSpan: 6 },
          configuration: {
            configurationType: 'PIE_CHART',
            aggregateFieldName: 'id',
            aggregateOperation: 'COUNT',
            groupByFieldName: 'priority',
            orderBy: 'VALUE_DESC',
            displayDataLabel: true,
          },
        },
        {
          title: 'Recent Tickets',
          type: 'RECORD_TABLE',
          objectNameSingular: 'xopureSupportTicket',
          gridPosition: { row: 6, column: 0, rowSpan: 6, columnSpan: 12 },
          view: {
            name: 'Support Tickets',
            icon: 'IconLifebuoy',
            fields: [
              { fieldName: 'ticketNumber', position: 0, size: 120 },
              { fieldName: 'subject', position: 1, size: 200 },
              { fieldName: 'status', position: 2, size: 120 },
              { fieldName: 'priority', position: 3, size: 100 },
              { fieldName: 'requesterName', position: 4, size: 140 },
              { fieldName: 'lastActivityAt', position: 5, size: 160 },
            ],
          },
        },
      ],
    },
  ],
};
