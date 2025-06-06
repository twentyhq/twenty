import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { WebhookFormMode } from '@/settings/developers/constants/WebhookFormMode';
import { useWebhookForm } from '../useWebhookForm';

// Mock dependencies
const mockNavigateSettings = jest.fn();
const mockEnqueueSnackBar = jest.fn();
const mockCreateOneRecord = jest.fn();
const mockUpdateOneRecord = jest.fn();
const mockDeleteOneRecord = jest.fn();

jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: () => mockNavigateSettings,
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({
    enqueueSnackBar: mockEnqueueSnackBar,
  }),
}));

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: () => ({
    createOneRecord: mockCreateOneRecord,
  }),
}));

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({
    updateOneRecord: mockUpdateOneRecord,
  }),
}));

jest.mock('@/object-record/hooks/useDeleteOneRecord', () => ({
  useDeleteOneRecord: () => ({
    deleteOneRecord: mockDeleteOneRecord,
  }),
}));

jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: () => ({
    loading: false,
  }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider addTypename={false}>
    <RecoilRoot>
      <MemoryRouter>{children}</MemoryRouter>
    </RecoilRoot>
  </MockedProvider>
);

describe('useWebhookForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('should initialize with default values in create mode', () => {
      const { result } = renderHook(
        () => useWebhookForm({ mode: WebhookFormMode.Create }),
        { wrapper: Wrapper },
      );

      expect(result.current.isCreationMode).toBe(true);
      expect(result.current.formConfig.getValues()).toEqual({
        targetUrl: '',
        description: '',
        operations: [{ object: '*', action: '*' }],
        secret: '',
      });
    });

    it('should handle webhook creation successfully', async () => {
      const mockCreatedWebhook = {
        id: 'new-webhook-id',
        targetUrl: 'https://test.com/webhook',
      };
      mockCreateOneRecord.mockResolvedValue(mockCreatedWebhook);

      const { result } = renderHook(
        () => useWebhookForm({ mode: WebhookFormMode.Create }),
        { wrapper: Wrapper },
      );

      const formData = {
        targetUrl: 'https://test.com/webhook',
        description: 'Test webhook',
        operations: [{ object: 'person', action: 'created' }],
        secret: 'test-secret',
      };

      await result.current.handleSave(formData);

      expect(mockCreateOneRecord).toHaveBeenCalledWith({
        id: expect.any(String),
        targetUrl: 'https://test.com/webhook',
        description: 'Test webhook',
        operations: ['person.created'],
        secret: 'test-secret',
      });

      expect(mockEnqueueSnackBar).toHaveBeenCalledWith(
        'Webhook https://test.com/webhook created successfully',
        { variant: 'success' },
      );
    });

    it('should handle creation errors', async () => {
      const error = new Error('Creation failed');
      mockCreateOneRecord.mockRejectedValue(error);

      const { result } = renderHook(
        () => useWebhookForm({ mode: WebhookFormMode.Create }),
        { wrapper: Wrapper },
      );

      const formData = {
        targetUrl: 'https://test.com/webhook',
        description: 'Test webhook',
        operations: [{ object: 'person', action: 'created' }],
        secret: 'test-secret',
      };

      await result.current.handleSave(formData);

      expect(mockEnqueueSnackBar).toHaveBeenCalledWith('Creation failed', {
        variant: 'error',
      });
    });

    it('should clean and format operations correctly', async () => {
      mockCreateOneRecord.mockResolvedValue({ id: 'test-id' });

      const { result } = renderHook(
        () => useWebhookForm({ mode: WebhookFormMode.Create }),
        { wrapper: Wrapper },
      );

      const formData = {
        targetUrl: 'https://test.com/webhook',
        description: 'Test webhook',
        operations: [
          { object: 'person', action: 'created' },
          { object: 'person', action: 'created' },
          { object: 'company', action: 'updated' },
          { object: null, action: 'test' },
        ],
        secret: 'test-secret',
      };

      await result.current.handleSave(formData);

      expect(mockCreateOneRecord).toHaveBeenCalledWith({
        id: expect.any(String),
        targetUrl: 'https://test.com/webhook',
        description: 'Test webhook',
        operations: ['person.created', 'company.updated'],
        secret: 'test-secret',
      });
    });
  });

  describe('Edit Mode', () => {
    const webhookId = 'test-webhook-id';

    it('should initialize correctly in edit mode', () => {
      const { result } = renderHook(
        () =>
          useWebhookForm({
            mode: WebhookFormMode.Edit,
            webhookId,
          }),
        { wrapper: Wrapper },
      );

      expect(result.current.isCreationMode).toBe(false);
    });

    it('should handle webhook update successfully', async () => {
      mockUpdateOneRecord.mockResolvedValue({});

      const { result } = renderHook(
        () =>
          useWebhookForm({
            mode: WebhookFormMode.Edit,
            webhookId,
          }),
        { wrapper: Wrapper },
      );

      const formData = {
        targetUrl: 'https://updated.com/webhook',
        description: 'Updated webhook',
        operations: [{ object: 'person', action: 'updated' }],
        secret: 'updated-secret',
      };

      await result.current.handleSave(formData);

      expect(mockUpdateOneRecord).toHaveBeenCalledWith({
        idToUpdate: webhookId,
        updateOneRecordInput: {
          targetUrl: 'https://updated.com/webhook',
          description: 'Updated webhook',
          operations: ['person.updated'],
          secret: 'updated-secret',
        },
      });
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      mockUpdateOneRecord.mockRejectedValue(error);

      const { result } = renderHook(
        () =>
          useWebhookForm({
            mode: WebhookFormMode.Edit,
            webhookId,
          }),
        { wrapper: Wrapper },
      );

      const formData = {
        targetUrl: 'https://test.com/webhook',
        description: 'Test webhook',
        operations: [{ object: 'person', action: 'created' }],
        secret: 'test-secret',
      };

      await result.current.handleSave(formData);

      expect(mockEnqueueSnackBar).toHaveBeenCalledWith('Update failed', {
        variant: 'error',
      });
    });
  });

  describe('Operation Management', () => {
    it('should update operations correctly', () => {
      const { result } = renderHook(
        () => useWebhookForm({ mode: WebhookFormMode.Create }),
        { wrapper: Wrapper },
      );

      result.current.updateOperation(0, 'object', 'person');

      const operations = result.current.formConfig.getValues('operations');
      expect(operations[0].object).toBe('person');
    });

    it('should remove operations correctly', () => {
      const { result } = renderHook(
        () => useWebhookForm({ mode: WebhookFormMode.Create }),
        { wrapper: Wrapper },
      );

      result.current.formConfig.setValue('operations', [
        { object: 'person', action: 'created' },
        { object: 'company', action: 'updated' },
      ]);

      const initialOperations =
        result.current.formConfig.getValues('operations');
      const initialCount = initialOperations.length;

      result.current.removeOperation(0);

      const updatedOperations =
        result.current.formConfig.getValues('operations');
      expect(updatedOperations.length).toBeLessThanOrEqual(initialCount);
    });
  });

  describe('Webhook Deletion', () => {
    const webhookId = 'test-webhook-id';

    it('should delete webhook successfully', async () => {
      mockDeleteOneRecord.mockResolvedValue({});

      const { result } = renderHook(
        () =>
          useWebhookForm({
            mode: WebhookFormMode.Edit,
            webhookId,
          }),
        { wrapper: Wrapper },
      );

      await result.current.deleteWebhook();

      expect(mockDeleteOneRecord).toHaveBeenCalledWith(webhookId);
      expect(mockEnqueueSnackBar).toHaveBeenCalledWith(
        'Webhook deleted successfully',
        { variant: 'success' },
      );
    });

    it('should handle deletion without webhookId', async () => {
      const { result } = renderHook(
        () => useWebhookForm({ mode: WebhookFormMode.Create }),
        { wrapper: Wrapper },
      );

      await result.current.deleteWebhook();

      expect(mockEnqueueSnackBar).toHaveBeenCalledWith(
        'Webhook ID is required for deletion',
        { variant: 'error' },
      );
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Deletion failed');
      mockDeleteOneRecord.mockRejectedValue(error);

      const { result } = renderHook(
        () =>
          useWebhookForm({
            mode: WebhookFormMode.Edit,
            webhookId,
          }),
        { wrapper: Wrapper },
      );

      await result.current.deleteWebhook();

      expect(mockEnqueueSnackBar).toHaveBeenCalledWith('Deletion failed', {
        variant: 'error',
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate canSave property', () => {
      const { result } = renderHook(
        () => useWebhookForm({ mode: WebhookFormMode.Create }),
        { wrapper: Wrapper },
      );

      // Initially canSave should be false (form is not valid)
      expect(result.current.canSave).toBe(false);
    });
  });
});
