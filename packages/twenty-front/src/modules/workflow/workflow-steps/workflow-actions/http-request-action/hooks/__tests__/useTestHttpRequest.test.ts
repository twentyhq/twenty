import { HttpRequestFormData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { RecoilRoot } from 'recoil';
import { useTestHttpRequest } from '../useTestHttpRequest';

// Mock the resolveInput function
jest.mock('twenty-shared/utils', () => ({
  resolveInput: jest.fn((input) => input), // Simple passthrough by default
}));

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('useTestHttpRequest', () => {
  const actionId = 'test-action-id';
  
  const mockFormData: HttpRequestFormData = {
    url: 'https://api.example.com/users',
    method: 'GET',
    headers: { 'Authorization': 'Bearer {{token}}' },
    body: undefined,
  };

  const mockVariableValues = {
    token: 'test-token-123',
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => 
    React.createElement(RecoilRoot, null, children);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useTestHttpRequest(actionId), { 
      wrapper 
    });

    expect(result.current.isTesting).toBe(false);
    expect(result.current.testHttpRequest).toBeInstanceOf(Function);
    expect(result.current.httpRequestTestData).toBeDefined();
  });

  it('should handle successful GET request', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      json: jest.fn().mockResolvedValue({ id: 1, name: 'John' }),
      headers: new Map([['content-type', 'application/json']]),
    };

    mockFetch.mockResolvedValueOnce(mockResponse as any);

    const { result } = renderHook(() => useTestHttpRequest(actionId), { 
      wrapper 
    });

    await act(async () => {
      await result.current.testHttpRequest(mockFormData, mockVariableValues);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/users',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {{token}}',
        }),
      })
    );

    expect(result.current.isTesting).toBe(false);
    expect(result.current.httpRequestTestData.output?.status).toBe(200);
    expect(result.current.httpRequestTestData.output?.data).toBe('{\n  "id": 1,\n  "name": "John"\n}');
    expect(result.current.httpRequestTestData.output?.error).toBeUndefined();
  });

  it('should handle POST request with body', async () => {
    const postFormData: HttpRequestFormData = {
      ...mockFormData,
      method: 'POST',
      body: { name: 'Jane', email: 'jane@example.com' },
    };

    const mockResponse = {
      status: 201,
      statusText: 'Created',
      json: jest.fn().mockResolvedValue({ id: 2, name: 'Jane' }),
      headers: new Map([['content-type', 'application/json']]),
    };

    mockFetch.mockResolvedValueOnce(mockResponse as any);

    const { result } = renderHook(() => useTestHttpRequest(actionId), { 
      wrapper 
    });

    await act(async () => {
      await result.current.testHttpRequest(postFormData, mockVariableValues);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Jane', email: 'jane@example.com' }),
      })
    );

    expect(result.current.httpRequestTestData.output?.status).toBe(201);
  });

  it('should handle non-JSON responses', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      text: jest.fn().mockResolvedValue('Plain text response'),
      headers: new Map([['content-type', 'text/plain']]),
    };

    mockFetch.mockResolvedValueOnce(mockResponse as any);

    const { result } = renderHook(() => useTestHttpRequest(actionId), { 
      wrapper 
    });

    await act(async () => {
      await result.current.testHttpRequest(mockFormData, mockVariableValues);
    });

    expect(result.current.httpRequestTestData.output?.data).toBe('Plain text response');
    expect(result.current.httpRequestTestData.language).toBe('plaintext');
  });

  it('should handle request errors', async () => {
    const errorMessage = 'Network error';
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useTestHttpRequest(actionId), { 
      wrapper 
    });

    await act(async () => {
      await result.current.testHttpRequest(mockFormData, mockVariableValues);
    });

    expect(result.current.isTesting).toBe(false);
    expect(result.current.httpRequestTestData.output?.error).toBe(errorMessage);
    expect(result.current.httpRequestTestData.output?.status).toBeUndefined();
    expect(result.current.httpRequestTestData.language).toBe('plaintext');
  });

  it('should set isTesting to true during request', async () => {
    // Create a promise that we can control
    let resolvePromise: (value: any) => void;
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(mockPromise as any);

    const { result } = renderHook(() => useTestHttpRequest(actionId), { 
      wrapper 
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
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({}),
        headers: new Map([['content-type', 'application/json']]),
      });
      await mockPromise;
    });

    // Should no longer be testing
    expect(result.current.isTesting).toBe(false);
  });
});