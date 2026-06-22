import { defineLogicFunction } from 'twenty-sdk/define';

type Input = {
  query: string;
  context?: Record<string, unknown>;
};

type Output = {
  result: string;
  confidence: number;
  metadata: Record<string, unknown>;
};

const handler = async (input: Input): Promise<Output> => {
  return {
    result: `Ticket Ai Tool Workflow processed query: "${input.query}"`,
    confidence: 1,
    metadata: {
      handledBy: 'TicketAiToolWorkflow',
      timestamp: new Date().toISOString(),
      context: input.context ?? {},
    },
  };
};

export default defineLogicFunction({
  universalIdentifier: '730cde2f-0e2e-49cc-aca3-76fc105add26',
  name: 'ticket-ai-tool-workflow',
  description: 'AI-callable tool that performs TicketAiToolWorkflow operations.',
  handler,
  workflowActionTriggerSettings: {
    label: 'Ticket Ai Tool Workflow AI Tool',
    icon: 'IconSparkles',
    inputSchema: [
      {
        type: 'object',
        properties: {
          query: { type: 'string', label: 'Query' },
          context: { type: 'object', label: 'Context' },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          result: { type: 'string', label: 'Result' },
          confidence: { type: 'number', label: 'Confidence' },
          metadata: { type: 'object', label: 'Metadata' },
        },
      },
    ],
  },
  toolTriggerSettings: {
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The query to process with Ticket Ai Tool Workflow.',
        },
        context: {
          type: 'object',
          description: 'Optional structured context for Ticket Ai Tool Workflow.',
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
});
