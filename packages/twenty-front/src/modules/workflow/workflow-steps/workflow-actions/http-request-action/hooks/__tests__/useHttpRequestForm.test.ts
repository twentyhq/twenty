import { type WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { act, renderHook } from '@testing-library/react';
import { useHttpRequestForm } from '@/workflow/workflow-steps/workflow-actions/http-request-action/hooks/useHttpRequestForm';

describe('useHttpRequestForm', () => {
  const mockAction: WorkflowHttpRequestAction = {
    id: 'test-id',
    name: 'Test HTTP Request',
    type: 'HTTP_REQUEST',
    valid: true,
    settings: {
      input: {
        url: 'https://api.example.com',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: undefined,
      },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false },
      },
    },
  };

  const mockOnActionUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with correct form data', () => {
    const { result } = renderHook(() =>
      useHttpRequestForm({
        action: mockAction,
        onActionUpdate: mockOnActionUpdate,
        readonly: false,
      }),
    );

    expect(result.current.formData).toEqual({
      url: 'https://api.example.com',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    });
  });

  it('should handle body changes for POST method', () => {
    const postAction: WorkflowHttpRequestAction = {
      ...mockAction,
      settings: {
        ...mockAction.settings,
        input: {
          ...mockAction.settings.input,
          method: 'POST',
        },
      },
    };

    const { result } = renderHook(() =>
      useHttpRequestForm({
        action: postAction,
        onActionUpdate: mockOnActionUpdate,
        readonly: false,
      }),
    );

    act(() => {
      result.current.handleFieldChange('body', { data: 'test' });
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockOnActionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        settings: expect.objectContaining({
          input: expect.objectContaining({
            body: { data: 'test' },
          }),
        }),
      }),
    );
  });

  it('should handle readonly mode', () => {
    const { result } = renderHook(() =>
      useHttpRequestForm({
        action: mockAction,
        onActionUpdate: mockOnActionUpdate,
        readonly: true,
      }),
    );

    act(() => {
      result.current.handleFieldChange('url', 'https://new-url.com');
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockOnActionUpdate).not.toHaveBeenCalled();
  });
});
