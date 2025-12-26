import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type HttpRequestFormData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { useMutation } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { RecoilRoot } from 'recoil';
import { resolveInput } from 'twenty-shared/utils';
import { useTestHttpRequest } from '@/workflow/workflow-steps/workflow-actions/http-request-action/hooks/useTestHttpRequest';

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useMutation: jest.fn(),
}));

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: jest.fn(),
}));

// Mock the resolveInput function
jest.mock('twenty-shared/utils', () => ({
  ...jest.requireActual('twenty-shared/utils'),
  resolveInput: jest.fn((input, context) => {
    // For testing purposes, we'll actually do the replacement for simple cases
    if (typeof input === 'string') {
      return input.replace(/{{([^}]+)}}/g, (match, path) => {
        const parts = path.split('.');
        let current = context;
        for (const part of parts) {
          if (
            current !== null &&
            current !== undefined &&
            typeof current === 'object' &&
            part in current
          ) {
            current = (current as any)[part];
          } else {
            return 'undefined';
          }
        }
        return current;
      });
    } else if (typeof input === 'object' && input !== null) {
      // Handle object replacement recursively
      const result = { ...input };
      for (const [key, value] of Object.entries(input)) {
        if (typeof value === 'string') {
          result[key] = value.replace(/{{([^}]+)}}/g, (match, path) => {
            const parts = path.split('.');
            let current = context;
            for (const part of parts) {
              if (
                current !== null &&
                current !== undefined &&
                typeof current === 'object' &&
                part in current
              ) {
                current = (current as any)[part];
              } else {
                return 'undefined';
              }
            }
            return current;
          });
        }
      }
      return result;
    }
    return input;
  }),
}));

describe('useTestHttpRequest', () => {
  const actionId = 'test-action-id';
  const mockApolloClient = {};
  const mockMutate = jest.fn();

  const mockFormData: HttpRequestFormData = {
    url: 'https://api.example.com/users',
    method: 'GET',
    headers: { Authorization: 'Bearer {{token}}' },
    body: undefined,
  };

  const mockVariableValues = {
    token: 'test-token-123',
  };

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(RecoilRoot, null, children);

  beforeEach(() => {
    jest.clearAllMocks();
    (useApolloCoreClient as jest.Mock).mockReturnValue(mockApolloClient);
    (useMutation as jest.Mock).mockReturnValue([mockMutate]);
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useTestHttpRequest(actionId), {
      wrapper,
    });

    expect(result.current.isTesting).toBe(false);
    expect(result.current.testHttpRequest).toBeInstanceOf(Function);
    expect(result.current.httpRequestTestData).toBeDefined();
  });

  it('should handle successful GET request with JSON response', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        testHttpRequest: {
          success: true,
          message:
            'HTTP GET request to https://api.example.com/users completed successfully',
          result: { id: 1, name: 'John' },
          error: null,
        },
      },
    });

    const { result } = renderHook(() => useTestHttpRequest(actionId), {
      wrapper,
    });

    await act(async () => {
      await result.current.testHttpRequest(mockFormData, mockVariableValues);
    });

    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        input: {
          url: 'https://api.example.com/users',
          method: 'GET',
          headers: { Authorization: 'Bearer test-token-123' },
          body: undefined,
        },
      },
    });

    expect(result.current.isTesting).toBe(false);
    expect(result.current.httpRequestTestData.output?.status).toBe(200);
    expect(result.current.httpRequestTestData.output?.data).toBe(
      '{\n  "id": 1,\n  "name": "John"\n}',
    );
    expect(result.current.httpRequestTestData.output?.error).toBeUndefined();
    expect(result.current.httpRequestTestData.language).toBe('json');
  });

  it('should handle successful POST request with body', async () => {
    const postFormData: HttpRequestFormData = {
      ...mockFormData,
      method: 'POST',
      body: { name: 'Jane', email: 'jane@example.com' },
    };

    mockMutate.mockResolvedValueOnce({
      data: {
        testHttpRequest: {
          success: true,
          message: 'HTTP POST request completed successfully',
          result: { id: 2, name: 'Jane', email: 'jane@example.com' },
          error: null,
        },
      },
    });

    const { result } = renderHook(() => useTestHttpRequest(actionId), {
      wrapper,
    });

    await act(async () => {
      await result.current.testHttpRequest(postFormData, mockVariableValues);
    });

    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        input: {
          url: 'https://api.example.com/users',
          method: 'POST',
          headers: { Authorization: 'Bearer test-token-123' },
          body: { name: 'Jane', email: 'jane@example.com' },
        },
      },
    });

    expect(result.current.httpRequestTestData.output?.status).toBe(200);
    expect(result.current.httpRequestTestData.language).toBe('json');
  });

  it('should handle string response from backend', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        testHttpRequest: {
          success: true,
          message: 'HTTP GET request completed successfully',
          result: 'Plain text response',
          error: null,
        },
      },
    });

    const { result } = renderHook(() => useTestHttpRequest(actionId), {
      wrapper,
    });

    await act(async () => {
      await result.current.testHttpRequest(mockFormData, mockVariableValues);
    });

    expect(result.current.httpRequestTestData.output?.data).toBe(
      'Plain text response',
    );
    expect(result.current.httpRequestTestData.language).toBe('plaintext');
  });

  it('should handle backend errors (success=false)', async () => {
    const errorMessage = 'HTTP request failed';
    mockMutate.mockResolvedValueOnce({
      data: {
        testHttpRequest: {
          success: false,
          message: 'HTTP GET request to https://api.example.com/users failed',
          result: null,
          error: errorMessage,
        },
      },
    });

    const { result } = renderHook(() => useTestHttpRequest(actionId), {
      wrapper,
    });

    await act(async () => {
      await result.current.testHttpRequest(mockFormData, mockVariableValues);
    });

    expect(result.current.isTesting).toBe(false);
    expect(result.current.httpRequestTestData.output?.error).toBe(errorMessage);
    expect(result.current.httpRequestTestData.output?.status).toBeUndefined();
    expect(result.current.httpRequestTestData.language).toBe('plaintext');
  });

  it('should handle GraphQL mutation errors', async () => {
    const errorMessage = 'Network error';
    mockMutate.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useTestHttpRequest(actionId), {
      wrapper,
    });

    await act(async () => {
      await result.current.testHttpRequest(mockFormData, mockVariableValues);
    });

    expect(result.current.isTesting).toBe(false);
    expect(result.current.httpRequestTestData.output?.error).toBe(errorMessage);
    expect(result.current.httpRequestTestData.output?.status).toBeUndefined();
    expect(result.current.httpRequestTestData.language).toBe('plaintext');
  });

  it('should handle missing response data', async () => {
    mockMutate.mockResolvedValueOnce({
      data: null,
    });

    const { result } = renderHook(() => useTestHttpRequest(actionId), {
      wrapper,
    });

    await act(async () => {
      await result.current.testHttpRequest(mockFormData, mockVariableValues);
    });

    expect(result.current.isTesting).toBe(false);
    expect(result.current.httpRequestTestData.output?.error).toBe(
      'No response from server',
    );
  });

  it('should set isTesting to true during request', async () => {
    // Create a promise that we can control
    let resolvePromise: (value: any) => void;
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockMutate.mockReturnValueOnce(mockPromise);

    const { result } = renderHook(() => useTestHttpRequest(actionId), {
      wrapper,
    });

    // Start the request
    act(() => {
      result.current.testHttpRequest(mockFormData, mockVariableValues);
    });

    // Should be testing now
    expect(result.current.isTesting).toBe(true);

    // Complete the request
    await act(async () => {
      resolvePromise!({
        data: {
          testHttpRequest: {
            success: true,
            message: 'Success',
            result: {},
            error: null,
          },
        },
      });
      await mockPromise;
    });

    // Should no longer be testing
    expect(result.current.isTesting).toBe(false);
  });

  it('should convert flat variable paths to nested context for proper substitution', async () => {
    const formDataWithNestedVariables: HttpRequestFormData = {
      url: 'https://api.example.com/users',
      method: 'POST',
      headers: { Authorization: 'Bearer {{auth.token}}' },
      body: { name: '{{trigger.properties.after.name}}' },
    };

    const flatVariableValues = {
      'auth.token': 'test-token-123',
      'trigger.properties.after.name': 'Yo',
    };

    mockMutate.mockResolvedValueOnce({
      data: {
        testHttpRequest: {
          success: true,
          message: 'Success',
          result: { success: true },
          error: null,
        },
      },
    });

    const { result } = renderHook(() => useTestHttpRequest(actionId), {
      wrapper,
    });

    await act(async () => {
      await result.current.testHttpRequest(
        formDataWithNestedVariables,
        flatVariableValues,
      );
    });

    // The mocked resolveInput should have been called with nested context
    expect(resolveInput).toHaveBeenCalledWith('https://api.example.com/users', {
      auth: { token: 'test-token-123' },
      trigger: { properties: { after: { name: 'Yo' } } },
    });
    expect(resolveInput).toHaveBeenCalledWith(
      { Authorization: 'Bearer {{auth.token}}' },
      {
        auth: { token: 'test-token-123' },
        trigger: { properties: { after: { name: 'Yo' } } },
      },
    );
    expect(resolveInput).toHaveBeenCalledWith(
      { name: '{{trigger.properties.after.name}}' },
      {
        auth: { token: 'test-token-123' },
        trigger: { properties: { after: { name: 'Yo' } } },
      },
    );
  });

  it('should handle non-string error responses', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        testHttpRequest: {
          success: false,
          message: 'Request failed',
          result: null,
          error: {
            code: 'ERR_CONNECTION_REFUSED',
            details: 'Connection refused',
          },
        },
      },
    });

    const { result } = renderHook(() => useTestHttpRequest(actionId), {
      wrapper,
    });

    await act(async () => {
      await result.current.testHttpRequest(mockFormData, mockVariableValues);
    });

    expect(result.current.httpRequestTestData.output?.error).toBe(
      `{
  "code": "ERR_CONNECTION_REFUSED",
  "details": "Connection refused"
}`,
    );
  });

  it('should track request duration', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        testHttpRequest: {
          success: true,
          message: 'Success',
          result: { id: 1 },
          error: null,
        },
      },
    });

    const { result } = renderHook(() => useTestHttpRequest(actionId), {
      wrapper,
    });

    await act(async () => {
      await result.current.testHttpRequest(mockFormData, mockVariableValues);
    });

    expect(result.current.httpRequestTestData.output?.duration).toBeDefined();
    expect(typeof result.current.httpRequestTestData.output?.duration).toBe(
      'number',
    );
    expect(
      result.current.httpRequestTestData.output?.duration,
    ).toBeGreaterThanOrEqual(0);
  });
});
