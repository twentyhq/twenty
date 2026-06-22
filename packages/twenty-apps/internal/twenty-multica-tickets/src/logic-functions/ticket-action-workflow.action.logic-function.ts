import { defineLogicFunction } from 'twenty-sdk/define';

type Input = {
  recordId?: string;
};

type Output = {
  success: boolean;
  message: string;
  processedAt: string;
};

const handler = async (input: Input): Promise<Output> => {
  return {
    success: true,
    message: `Ticket Action Workflow completed for record ${input.recordId ?? '(none)'}`,
    processedAt: new Date().toISOString(),
  };
};

export default defineLogicFunction({
  universalIdentifier: 'd33eab37-e8b2-4d5e-a406-689e32b08855',
  name: 'ticket-action-workflow',
  description: 'Workflow action that executes TicketActionWorkflow logic.',
  handler,
  workflowActionTriggerSettings: {
    label: 'Ticket Action Workflow',
    icon: 'IconBolt',
    inputSchema: [
      {
        type: 'object',
        properties: {
          recordId: {
            type: 'string',
            label: 'Record Id',
          },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean', label: 'Success' },
          message: { type: 'string', label: 'Message' },
          processedAt: { type: 'string', label: 'Processed At' },
        },
      },
    ],
  },
});
