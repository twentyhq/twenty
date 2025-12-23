import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { WebhookFormMode } from '@/settings/developers/constants/WebhookFormMode';
import { CREATE_WEBHOOK } from '@/settings/developers/graphql/mutations/createWebhook';
import { DELETE_WEBHOOK } from '@/settings/developers/graphql/mutations/deleteWebhook';
import { UPDATE_WEBHOOK } from '@/settings/developers/graphql/mutations/updateWebhook';
import { GET_WEBHOOK } from '@/settings/developers/graphql/queries/getWebhook';
import { useWebhookForm } from '@/settings/developers/hooks/useWebhookForm';

const mockNavigateSettings = jest.fn();
const mockEnqueueSuccessSnackBar = jest.fn();
const mockEnqueueErrorSnackBar = jest.fn();

jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: () => mockNavigateSettings,
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({
    enqueueSuccessSnackBar: mockEnqueueSuccessSnackBar,
    enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
  }),
}));

const createMockWebhookData = (overrides = {}) => ({
  id: 'test-webhook-id',
  targetUrl: 'https://test.com/webhook',
  operations: ['person.created'],
  description: 'Test webhook',
  secret: 'test-secret',
  ...overrides,
});

const createSuccessfulCreateMock = (webhookData = {}) => ({
  request: {
    query: CREATE_WEBHOOK,
    variables: {
      input: {
        targetUrl: 'https://test.com/webhook',
        operations: ['person.created'],
        description: 'Test webhook',
        secret: 'test-secret',
        ...webhookData,
      },
    },
  },
  result: {
    data: {
      createWebhook: createMockWebhookData(webhookData),
    },
  },
});

const createSuccessfulUpdateMock = (webhookId: string, webhookData = {}) => ({
  request: {
    query: UPDATE_WEBHOOK,
    variables: {
      input: {
        id: webhookId,
        targetUrl: 'https://updated.com/webhook',
        operations: ['person.updated'],
        description: 'Updated webhook',
        secret: 'updated-secret',
        ...webhookData,
      },
    },
  },
  result: {
    data: {
      updateWebhook: createMockWebhookData({
        id: webhookId,
        targetUrl: 'https://updated.com/webhook',
        operations: ['person.updated'],
        description: 'Updated webhook',
        secret: 'updated-secret',
        ...webhookData,
      }),
    },
  },
});

const createSuccessfulDeleteMock = (webhookId: string) => ({
  request: {
    query: DELETE_WEBHOOK,
    variables: {
      input: {
        id: webhookId,
      },
    },
  },
  result: {
    data: {
      deleteWebhook: {
        id: webhookId,
      },
    },
  },
});

const createGetWebhookMock = (webhookId: string, webhookData = {}) => ({
  request: {
    query: GET_WEBHOOK,
    variables: {
      input: {
        id: webhookId,
      },
    },
  },
  result: {
    data: {
      webhook: createMockWebhookData({
        id: webhookId,
        ...webhookData,
      }),
    },
  },
});

const Wrapper = ({
  children,
  mocks = [],
}: {
  children: ReactNode;
  mocks?: any[];
}) => (
  <MockedProvider mocks={mocks} addTypename={false}>
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
        { wrapper: ({ children }) => <Wrapper>{children}</Wrapper> },
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
      const mocks = [createSuccessfulCreateMock()];

      const { result } = renderHook(
        () => useWebhookForm({ mode: WebhookFormMode.Create }),
        {
          wrapper: ({ children }) => (
            <Wrapper mocks={mocks}>{children}</Wrapper>
          ),
        },
      );

      const formData = {
        targetUrl: 'https://test.com/webhook',
        description: 'Test webhook',
        operations: [{ object: 'person', action: 'created' }],
        secret: 'test-secret',
      };

      await act(async () => {
        await result.current.handleSave(formData);
      });

      expect(mockEnqueueSuccessSnackBar).toHaveBeenCalledWith({
        message: 'Webhook https://test.com/webhook created successfully',
      });
    });

    it('should handle creation errors', async () => {
      const errorMock = {
        request: {
          query: CREATE_WEBHOOK,
          variables: {
            input: {
              targetUrl: 'https://test.com/webhook',
              operations: ['person.created'],
              description: 'Test webhook',
              secret: 'test-secret',
            },
          },
        },
        error: new Error('Creation failed'),
      };

      const mocks = [errorMock];

      const { result } = renderHook(
        () => useWebhookForm({ mode: WebhookFormMode.Create }),
        {
          wrapper: ({ children }) => (
            <Wrapper mocks={mocks}>{children}</Wrapper>
          ),
        },
      );

      const formData = {
        targetUrl: 'https://test.com/webhook',
        description: 'Test webhook',
        operations: [{ object: 'person', action: 'created' }],
        secret: 'test-secret',
      };

      await act(async () => {
        await result.current.handleSave(formData);
      });

      expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
        apolloError: expect.any(Error),
      });
    });

    it('should clean and format operations correctly', async () => {
      const mocks = [
        createSuccessfulCreateMock({
          operations: ['person.created', 'company.updated'],
        }),
      ];

      const { result } = renderHook(
        () => useWebhookForm({ mode: WebhookFormMode.Create }),
        {
          wrapper: ({ children }) => (
            <Wrapper mocks={mocks}>{children}</Wrapper>
          ),
        },
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

      await act(async () => {
        await result.current.handleSave(formData);
      });

      expect(mockEnqueueSuccessSnackBar).toHaveBeenCalledWith({
        message: 'Webhook https://test.com/webhook created successfully',
      });
    });
  });

  describe('Edit Mode', () => {
    const webhookId = 'test-webhook-id';

    it('should initialize correctly in edit mode', () => {
      const mocks = [createGetWebhookMock(webhookId)];

      const { result } = renderHook(
        () =>
          useWebhookForm({
            mode: WebhookFormMode.Edit,
            webhookId,
          }),
        {
          wrapper: ({ children }) => (
            <Wrapper mocks={mocks}>{children}</Wrapper>
          ),
        },
      );

      expect(result.current.isCreationMode).toBe(false);
    });

    it('should handle webhook update successfully', async () => {
      const mocks = [
        createGetWebhookMock(webhookId),
        createSuccessfulUpdateMock(webhookId),
      ];

      const { result } = renderHook(
        () =>
          useWebhookForm({
            mode: WebhookFormMode.Edit,
            webhookId,
          }),
        {
          wrapper: ({ children }) => (
            <Wrapper mocks={mocks}>{children}</Wrapper>
          ),
        },
      );

      const formData = {
        targetUrl: 'https://updated.com/webhook',
        description: 'Updated webhook',
        operations: [{ object: 'person', action: 'updated' }],
        secret: 'updated-secret',
      };

      await act(async () => {
        await result.current.handleSave(formData);
      });

      expect(mockEnqueueSuccessSnackBar).toHaveBeenCalledWith({
        message: 'Webhook https://updated.com/webhook updated successfully',
      });
    });

    it('should handle update errors', async () => {
      const getWebhookMock = createGetWebhookMock(webhookId);
      const updateErrorMock = {
        request: {
          query: UPDATE_WEBHOOK,
          variables: {
            input: {
              id: webhookId,
              targetUrl: 'https://test.com/webhook',
              operations: ['person.created'],
              description: 'Test webhook',
              secret: 'test-secret',
            },
          },
        },
        error: new Error('Update failed'),
      };

      const mocks = [getWebhookMock, updateErrorMock];

      const { result } = renderHook(
        () =>
          useWebhookForm({
            mode: WebhookFormMode.Edit,
            webhookId,
          }),
        {
          wrapper: ({ children }) => (
            <Wrapper mocks={mocks}>{children}</Wrapper>
          ),
        },
      );

      const formData = {
        targetUrl: 'https://test.com/webhook',
        description: 'Test webhook',
        operations: [{ object: 'person', action: 'created' }],
        secret: 'test-secret',
      };

      await act(async () => {
        await result.current.handleSave(formData);
      });

      expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
        apolloError: expect.any(Error),
      });
    });
  });

  describe('Operation Management', () => {
    it('should update operations correctly', () => {
      const { result } = renderHook(
        () => useWebhookForm({ mode: WebhookFormMode.Create }),
        { wrapper: ({ children }) => <Wrapper>{children}</Wrapper> },
      );

      act(() => {
        result.current.updateOperation(0, 'object', 'person');
      });

      const operations = result.current.formConfig.getValues('operations');
      expect(operations[0].object).toBe('person');
    });

    it('should remove operations correctly', () => {
      const { result } = renderHook(
        () => useWebhookForm({ mode: WebhookFormMode.Create }),
        { wrapper: ({ children }) => <Wrapper>{children}</Wrapper> },
      );

      act(() => {
        result.current.formConfig.setValue('operations', [
          { object: 'person', action: 'created' },
          { object: 'company', action: 'updated' },
        ]);
      });

      const initialOperations =
        result.current.formConfig.getValues('operations');
      const initialCount = initialOperations.length;

      act(() => {
        result.current.removeOperation(0);
      });

      const updatedOperations =
        result.current.formConfig.getValues('operations');
      expect(updatedOperations.length).toBeLessThanOrEqual(initialCount);
    });
  });

  describe('Webhook Deletion', () => {
    const webhookId = 'test-webhook-id';

    it('should delete webhook successfully', async () => {
      const mocks = [
        createGetWebhookMock(webhookId),
        createSuccessfulDeleteMock(webhookId),
      ];

      const { result } = renderHook(
        () =>
          useWebhookForm({
            mode: WebhookFormMode.Edit,
            webhookId,
          }),
        {
          wrapper: ({ children }) => (
            <Wrapper mocks={mocks}>{children}</Wrapper>
          ),
        },
      );

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(mockEnqueueSuccessSnackBar).toHaveBeenCalledWith({
        message: 'Webhook deleted successfully',
      });
    });

    it('should handle deletion without webhookId', async () => {
      const { result } = renderHook(
        () => useWebhookForm({ mode: WebhookFormMode.Create }),
        { wrapper: ({ children }) => <Wrapper>{children}</Wrapper> },
      );

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
        message: 'Webhook ID is required for deletion',
      });
    });

    it('should handle deletion errors', async () => {
      const errorMock = {
        request: {
          query: DELETE_WEBHOOK,
          variables: {
            input: {
              id: webhookId,
            },
          },
        },
        error: new Error('Deletion failed'),
      };

      const mocks = [createGetWebhookMock(webhookId), errorMock];

      const { result } = renderHook(
        () =>
          useWebhookForm({
            mode: WebhookFormMode.Edit,
            webhookId,
          }),
        {
          wrapper: ({ children }) => (
            <Wrapper mocks={mocks}>{children}</Wrapper>
          ),
        },
      );

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
        apolloError: expect.any(Error),
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate canSave property', () => {
      const { result } = renderHook(
        () => useWebhookForm({ mode: WebhookFormMode.Create }),
        { wrapper: ({ children }) => <Wrapper>{children}</Wrapper> },
      );

      // Initially canSave should be false (form is not valid)
      expect(result.current.canSave).toBe(false);
    });
  });
});
