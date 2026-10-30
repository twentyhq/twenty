import {
  createWebhookCreateInput,
  createWebhookUpdateInput,
} from '@/settings/developers/utils/createWebhookInput';
import { type WebhookFormValues } from '@/settings/developers/validation-schemas/webhookFormSchema';

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
    roleId: 'role-id',
  };

  describe('createWebhookCreateInput', () => {
    it('should create input for webhook creation', () => {
      const result = createWebhookCreateInput({
        formValues: mockFormValues,
        canAssignRole: false,
      });

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

      const result = createWebhookCreateInput({
        formValues,
        canAssignRole: false,
      });

      expect(result.targetUrl).toBe('https://example.com');
    });

    it('should include the role when the user can assign roles', () => {
      const result = createWebhookCreateInput({
        formValues: mockFormValues,
        canAssignRole: true,
      });

      expect(result.roleId).toBe('role-id');
    });

    it('should omit an empty role on creation', () => {
      const result = createWebhookCreateInput({
        formValues: { ...mockFormValues, roleId: null },
        canAssignRole: true,
      });

      expect(result).not.toHaveProperty('roleId');
    });
  });

  describe('createWebhookUpdateInput', () => {
    it('should create input for webhook update with id', () => {
      const result = createWebhookUpdateInput({
        formValues: mockFormValues,
        canAssignRole: false,
      });

      expect(result).toEqual({
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

      const result = createWebhookUpdateInput({
        formValues,
        canAssignRole: false,
      });

      expect(result.targetUrl).toBe('https://example.com');
    });

    it('should send a null role to remove it when the user can assign roles', () => {
      const result = createWebhookUpdateInput({
        formValues: { ...mockFormValues, roleId: null },
        canAssignRole: true,
      });

      expect(result.roleId).toBeNull();
    });
  });
});
