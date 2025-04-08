import { WorkflowWebhookTrigger } from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { WebhookHttpMethods } from '@/workflow/workflow-trigger/constants/WebhookTriggerHttpMethodOptions';

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
        authentication: null,
      };
  }
  return assertUnreachable(webhookHttpMethods, 'Invalid webhook http method');
};
