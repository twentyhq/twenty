import { type WebhookFormValues } from '@/settings/developers/validation-schemas/webhookFormSchema';
import {
  createWebhookCreateInput,
  createWebhookUpdateInput,
} from '@/settings/developers/utils/createWebhookInput';

describe('createWebhookInput', () => {
  const mockFormValues: WebhookFormValues = {
    targetUrl: '  https://test.com/webhook  ',
    description: 'Test webhook',
    operations: [
      { object: 'person', action: 'created' },
      { object: 'person', action: 'created' }, // duplicate
      { object: 'company', action: 'updated' },
      { object: null, action: 'test' }, // should be filtered out
    ],
    secret: 'test-secret',
  };

  describe('createWebhookCreateInput', () => {
    it('should create input for webhook creation', () => {
      const result = createWebhookCreateInput(mockFormValues);

      expect(result).toEqual({
        targetUrl: 'https://test.com/webhook',
        operations: ['person.created', 'company.updated'],
        description: 'Test webhook',
        secret: 'test-secret',
      });
    });

    it('should trim targetUrl', () => {
      const formValues: WebhookFormValues = {
        ...mockFormValues,
        targetUrl: '   https://example.com   ',
      };

      const result = createWebhookCreateInput(formValues);

      expect(result.targetUrl).toBe('https://example.com');
    });
  });

  describe('createWebhookUpdateInput', () => {
    it('should create input for webhook update with id', () => {
      const webhookId = 'test-webhook-id';
      const result = createWebhookUpdateInput(mockFormValues, webhookId);

      expect(result).toEqual({
        id: 'test-webhook-id',
        targetUrl: 'https://test.com/webhook',
        operations: ['person.created', 'company.updated'],
        description: 'Test webhook',
        secret: 'test-secret',
      });
    });

    it('should trim targetUrl and include id', () => {
      const formValues: WebhookFormValues = {
        ...mockFormValues,
        targetUrl: '   https://example.com   ',
      };
      const webhookId = 'test-webhook-id';

      const result = createWebhookUpdateInput(formValues, webhookId);

      expect(result.targetUrl).toBe('https://example.com');
      expect(result.id).toBe('test-webhook-id');
    });
  });
});
