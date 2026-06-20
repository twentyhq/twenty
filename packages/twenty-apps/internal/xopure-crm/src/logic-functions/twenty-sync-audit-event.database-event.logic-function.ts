import { defineLogicFunction } from 'twenty-sdk/define';

type Input = {
  recordId?: string;
  eventName?: string;
  updatedFields?: string[];
  payload?: Record<string, unknown>;
};

type Output = {
  success: boolean;
  eventName: string;
  recordId?: string;
  processedAt: string;
};

const handler = async (input: Input): Promise<Output> => {
  return {
    success: true,
    eventName: input.eventName ?? 'twenty-sync-audit-event.*',
    recordId: input.recordId,
    processedAt: new Date().toISOString(),
  };
};

export default defineLogicFunction({
  universalIdentifier: '18e7c423-57fb-4632-bf64-0d7389937af9',
  name: 'twenty-sync-audit-event',
  description: 'Database event workflow that reacts to TwentySyncAuditEvent record changes.',
  timeoutSeconds: 60,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'twenty-sync-audit-event.*',
  },
  workflowActionTriggerSettings: {
    label: 'Twenty Sync Audit Event Database Event',
    icon: 'IconDatabase',
    inputSchema: [
      {
        type: 'object',
        properties: {
          recordId: { type: 'string' },
          eventName: { type: 'string' },
          updatedFields: {
            type: 'array',
            items: { type: 'string' },
          },
          payload: { type: 'object' },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          eventName: { type: 'string' },
          recordId: { type: 'string' },
          processedAt: { type: 'string' },
        },
      },
    ],
  },
});
