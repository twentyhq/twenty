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
    eventName: input.eventName ?? 'ticket-database-event-workflow.*',
    recordId: input.recordId,
    processedAt: new Date().toISOString(),
  };
};

export default defineLogicFunction({
  universalIdentifier: '56c799bc-9ff2-45c0-81d4-ce9c614ae8c9',
  name: 'ticket-database-event-workflow',
  description: 'Database event workflow that reacts to TicketDatabaseEventWorkflow record changes.',
  timeoutSeconds: 60,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'ticket-database-event-workflow.*',
  },
  workflowActionTriggerSettings: {
    label: 'Ticket Database Event Workflow Database Event',
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
