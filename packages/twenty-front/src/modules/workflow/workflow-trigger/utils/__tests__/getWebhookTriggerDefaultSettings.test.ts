import { getWebhookTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getWebhookTriggerDefaultSettings';

describe('getWebhookTriggerDefaultSettings', () => {
  it('returns correct settings for GET http method', () => {
    const result = getWebhookTriggerDefaultSettings('GET');
    expect(result).toEqual({
      authentication: null,
      httpMethod: 'GET',
      outputSchema: {},
    });
  });

  it('returns correct settings for POST http method', () => {
    const result = getWebhookTriggerDefaultSettings('POST');
    expect(result).toEqual({
      authentication: null,
      httpMethod: 'POST',
      expectedBody: {
        message: 'Workflow was started',
      },
      outputSchema: {
        message: {
          icon: 'IconVariable',
          isLeaf: true,
          label: 'message',
          type: 'string',
          value: 'Workflow was started',
        },
      },
    });
  });

  it('throws an error for an invalid http method', () => {
    // @ts-expect-error Testing invalid input
    expect(() => getWebhookTriggerDefaultSettings('INVALID')).toThrowError(
      'Invalid webhook http method',
    );
  });
});
