import type { DashboardBlueprint } from './dashboard-blueprint.type';

export const riskExceptionsDashboardBlueprint: DashboardBlueprint = {
  title: 'Risk / Exceptions Dashboard',
  tabs: [
    {
      key: 'risk-exceptions-dashboard',
      title: 'Risk / Exceptions',
      position: 0,
      widgets: [
        {
          title: 'Sync Map Exceptions',
          type: 'RECORD_TABLE',
          objectNameSingular: 'xopureSyncMap',
          gridPosition: { row: 0, column: 0, rowSpan: 6, columnSpan: 12 },
          view: {
            name: 'Sync Map Exceptions',
            icon: 'IconAlertTriangle',
            fields: [
              { fieldName: 'syncKey', position: 0, size: 220 },
              { fieldName: 'sourceTable', position: 1, size: 140 },
              { fieldName: 'targetObject', position: 2, size: 150 },
              { fieldName: 'lastStatus', position: 3, size: 130 },
              { fieldName: 'lastErrorSummary', position: 4, size: 260 },
              { fieldName: 'lastSyncedAt', position: 5, size: 160 },
            ],
          },
        },
        {
          title: 'Sync Cursor Status',
          type: 'RECORD_TABLE',
          objectNameSingular: 'xopureSyncCursor',
          gridPosition: { row: 6, column: 0, rowSpan: 5, columnSpan: 12 },
          view: {
            name: 'Sync Cursor Status',
            icon: 'IconPlayerTrackNext',
            fields: [
              { fieldName: 'step', position: 0, size: 220 },
              { fieldName: 'lastRunStatus', position: 1, size: 150 },
              { fieldName: 'lastRunAt', position: 2, size: 160 },
              { fieldName: 'cursorValue', position: 3, size: 220 },
              { fieldName: 'lastErrorSummary', position: 4, size: 260 },
            ],
          },
        },
        {
          title: 'Order Review Exceptions',
          type: 'RECORD_TABLE',
          objectNameSingular: 'xopureOrder',
          gridPosition: { row: 11, column: 0, rowSpan: 6, columnSpan: 12 },
          view: {
            name: 'Order Review Exceptions',
            icon: 'IconAlertCircle',
            fields: [
              { fieldName: 'orderNumber', position: 0, size: 150 },
              { fieldName: 'status', position: 1, size: 120 },
              { fieldName: 'paymentStatus', position: 2, size: 130 },
              { fieldName: 'manualReviewRequired', position: 3, size: 170 },
              { fieldName: 'refundAmount', position: 4, size: 120 },
              { fieldName: 'orderTotal', position: 5, size: 120 },
              { fieldName: 'customerEmail', position: 6, size: 220 },
              { fieldName: 'lastSyncedAt', position: 7, size: 160 },
            ],
          },
        },
        {
          title: 'Held / Pending Commissions',
          type: 'RECORD_TABLE',
          objectNameSingular: 'xopureCommission',
          gridPosition: { row: 17, column: 0, rowSpan: 6, columnSpan: 12 },
          view: {
            name: 'Held / Pending Commissions',
            icon: 'IconReceiptDollar',
            fields: [
              { fieldName: 'name', position: 0, size: 180 },
              { fieldName: 'status', position: 1, size: 120 },
              { fieldName: 'amount', position: 2, size: 120 },
              { fieldName: 'orderExternalId', position: 3, size: 180 },
              { fieldName: 'holdUntil', position: 4, size: 160 },
              { fieldName: 'payableAt', position: 5, size: 160 },
              { fieldName: 'lastSyncedAt', position: 6, size: 160 },
            ],
          },
        },
      ],
    },
  ],
};
