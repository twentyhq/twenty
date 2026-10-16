import { type WorkflowWebhookTrigger } from '@/workflow/types/Workflow';
import { type WebhookHttpMethods } from '@/workflow/workflow-trigger/constants/WebhookTriggerHttpMethodOptions';
import { assertUnreachable } from 'twenty-shared/utils';

// oxlint-disable lingui/no-unlocalized-strings -- Webhook example bodies are persisted API data and must remain stable across locales.
export const getWebhookTriggerDefaultSettings = (
  webhookHttpMethods: WebhookHttpMethods,
): WorkflowWebhookTrigger['settings'] => {
  switch (webhookHttpMethods) {
    case 'GET':
      return {
        outputSchema: {},
        httpMethod: webhookHttpMethods,
        authentication: null,
      };
    case 'POST':
      return {
        outputSchema: {
          message: {
            icon: 'IconVariable',
            type: 'string',
            label: 'message',
            value: 'Workflow was started',
            isLeaf: true,
          },
        },
        httpMethod: webhookHttpMethods,
        expectedBody: {
          message: 'Workflow was started',
        },
        expectedOutputSchema: {
          message: 'Workflow was started',
        },
        authentication: null,
      };
  }
  return assertUnreachable(webhookHttpMethods, 'Invalid webhook http method');
};
