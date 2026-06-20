import { defineLogicFunction } from 'twenty-sdk/define';

type WebhookPayload = {
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  query?: Record<string, string>;
  method?: string;
};

type Input = {
  payload: WebhookPayload;
  raw?: string;
};

type Output = {
  status: number;
  body: Record<string, unknown>;
  headers: Record<string, string>;
};

const handler = async (input: Input): Promise<Output> => {
  const event = input.payload.body ?? {};

  return {
    status: 200,
    body: {
      receivedAt: new Date().toISOString(),
      event,
      processedBy: 'supabase-webhook-ingest',
    },
    headers: { 'content-type': 'application/json' },
  };
};

export default defineLogicFunction({
  universalIdentifier: '02e136ab-c463-4f3c-8e99-7304b872be04',
  name: 'supabase-webhook-ingest',
  description: 'Webhook that receives and normalizes Supabase Webhook Ingest events.',
  handler,
  workflowActionTriggerSettings: {
    label: 'Supabase Webhook Ingest Webhook',
    icon: 'IconWebhook',
    inputSchema: [
      {
        type: 'object',
        properties: {
          payload: {
            type: 'object',
          },
          raw: {
            type: 'string',
          },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          status: { type: 'number' },
          body: { type: 'object' },
          headers: { type: 'object' },
        },
      },
    ],
  },
});
