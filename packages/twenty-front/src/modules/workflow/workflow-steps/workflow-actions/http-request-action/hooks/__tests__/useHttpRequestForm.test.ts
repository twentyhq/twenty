import { WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { act, renderHook } from '@testing-library/react';
import { useHttpRequestForm } from '../useHttpRequestForm';

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
      headers: JSON.stringify({ 'Content-Type': 'application/json' }, null, 2),
      body: null,
    });
  });

  it('should handle field changes and validate JSON', () => {
    const { result } = renderHook(() =>
      useHttpRequestForm({
        action: mockAction,
        onActionUpdate: mockOnActionUpdate,
        readonly: false,
      }),
    );

    act(() => {
      result.current.handleFieldChange(
        'headers',
        JSON.stringify({ Authorization: 'Bearer token' }, null, 2),
      );
    });

    expect(result.current.errorMessages.headers).toBeUndefined();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockOnActionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        settings: expect.objectContaining({
          input: expect.objectContaining({
            headers: { Authorization: 'Bearer token' },
          }),
        }),
      }),
    );

    act(() => {
      result.current.handleFieldChange('headers', '{invalid json}');
    });

    expect(result.current.errorMessages.headers).toBeDefined();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockOnActionUpdate).not.toHaveBeenCalledWith(
      expect.objectContaining({
        settings: expect.objectContaining({
          input: expect.objectContaining({
            headers: '{invalid json}',
          }),
        }),
      }),
    );
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
      result.current.handleFieldChange(
        'body',
        JSON.stringify({ data: 'test' }, null, 2),
      );
    });

    expect(result.current.errorMessages.body).toBeUndefined();

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
