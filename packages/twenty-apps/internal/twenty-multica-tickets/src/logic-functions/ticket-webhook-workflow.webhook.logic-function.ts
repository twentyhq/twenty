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
      processedBy: 'ticket-webhook-workflow',
    },
    headers: { 'content-type': 'application/json' },
  };
};

export default defineLogicFunction({
  universalIdentifier: '59d955b1-8b21-4c68-9c02-df0aeabbcea8',
  name: 'ticket-webhook-workflow',
  description: 'Webhook that receives and normalizes Ticket Webhook Workflow events.',
  handler,
  workflowActionTriggerSettings: {
    label: 'Ticket Webhook Workflow Webhook',
    icon: 'IconWebhook',
    inputSchema: [
      {
        type: 'object',
        properties: {
          payload: {
            type: 'object',
            label: 'Payload',
          },
          raw: {
            type: 'string',
            label: 'Raw Body',
          },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          status: { type: 'number', label: 'HTTP Status' },
          body: { type: 'object', label: 'Response Body' },
          headers: { type: 'object', label: 'Response Headers' },
        },
      },
    ],
  },
});
