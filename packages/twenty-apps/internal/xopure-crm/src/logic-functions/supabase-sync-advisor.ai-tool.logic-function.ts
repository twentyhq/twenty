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
    result: `Supabase Sync Advisor processed query: "${input.query}"`,
    confidence: 1,
    metadata: {
      handledBy: 'SupabaseSyncAdvisor',
      timestamp: new Date().toISOString(),
      context: input.context ?? {},
    },
  };
};

export default defineLogicFunction({
  universalIdentifier: '173099ca-82cf-426d-b75c-b8ef67b4445f',
  name: 'supabase-sync-advisor',
  description: 'AI-callable tool that performs SupabaseSyncAdvisor operations.',
  handler,
  workflowActionTriggerSettings: {
    label: 'Supabase Sync Advisor AI Tool',
    icon: 'IconSparkles',
    inputSchema: [
      {
        type: 'object',
        properties: {
          query: { type: 'string' },
          context: { type: 'object' },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          result: { type: 'string' },
          confidence: { type: 'number' },
          metadata: { type: 'object' },
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
          description: 'The query to process with Supabase Sync Advisor.',
        },
        context: {
          type: 'object',
          description: 'Optional structured context for Supabase Sync Advisor.',
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
});
