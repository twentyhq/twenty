import { defineLogicFunction } from 'twenty-sdk/define';

type Input = {
  dryRun?: boolean;
  batchSize?: number;
  since?: string;
};

type Output = {
  processed: number;
  failed: number;
  total: number;
  dryRun: boolean;
  completedAt: string;
};

const handler = async (input: Input): Promise<Output> => {
  const dryRun = input.dryRun ?? false;
  const batchSize = input.batchSize ?? 100;
  const processed = dryRun ? 0 : batchSize;
  const failed = 0;

  return {
    processed,
    failed,
    total: processed + failed,
    dryRun,
    completedAt: new Date().toISOString(),
  };
};

export default defineLogicFunction({
  universalIdentifier: '45b11584-0832-4e7c-a5d6-a6be922111b1',
  name: 'ticket-scheduled-workflow',
  description: 'Scheduled task that runs TicketScheduledWorkflow processing on a cadence.',
  timeoutSeconds: 300,
  handler,
  cronTriggerSettings: {
    pattern: '0 * * * *',
  },
  workflowActionTriggerSettings: {
    label: 'Ticket Scheduled Workflow Scheduled Run',
    icon: 'IconClock',
    inputSchema: [
      {
        type: 'object',
        properties: {
          dryRun: { type: 'boolean', label: 'Dry Run' },
          batchSize: { type: 'number', label: 'Batch Size' },
          since: { type: 'string', label: 'Since' },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          processed: { type: 'number', label: 'Processed' },
          failed: { type: 'number', label: 'Failed' },
          total: { type: 'number', label: 'Total' },
          dryRun: { type: 'boolean', label: 'Dry Run' },
          completedAt: { type: 'string', label: 'Completed At' },
        },
      },
    ],
  },
});
