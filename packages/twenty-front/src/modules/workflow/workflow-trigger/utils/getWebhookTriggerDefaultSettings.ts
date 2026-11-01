import { type WorkflowWebhookTrigger } from '@/workflow/types/Workflow';
import { type WebhookHttpMethods } from '@/workflow/workflow-trigger/constants/WebhookTriggerHttpMethodOptions';
import { assertUnreachable } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

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
            label: doNotTranslate('message'),
            value: doNotTranslate('Workflow was started'),
            isLeaf: true,
          },
        },
        httpMethod: webhookHttpMethods,
        expectedBody: {
          message: doNotTranslate('Workflow was started'),
        },
        expectedOutputSchema: {
          message: doNotTranslate('Workflow was started'),
        },
        authentication: null,
      };
  }
  return assertUnreachable(webhookHttpMethods, 'Invalid webhook http method');
};
