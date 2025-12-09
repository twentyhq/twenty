import { type FunctionConfig } from 'twenty-sdk';
import type { ProcessResult } from './types';
import { WebhookHandler } from './webhook-handler';

export const main = async (
  params: unknown,
  headers?: Record<string, string>
): Promise<ProcessResult> => {
  const handler = new WebhookHandler();
  return handler.handle(params, headers);
};

export const config: FunctionConfig = {
  universalIdentifier: '2d3ea303-667c-4bbe-9e3d-db6ffb9d6c74',
  name: 'receive-fireflies-notes',
  description:
    'Receives Fireflies webhooks, fetches meeting summaries, and stores them in Twenty.',
  timeoutSeconds: 30,
  triggers: [
    {
      universalIdentifier: 'a2117dc1-7674-4c7e-9d70-9feb9820e9e8',
      type: 'route',
      path: '/webhook/fireflies',
      httpMethod: 'POST',
      isAuthRequired: false,
    },
  ],
};

