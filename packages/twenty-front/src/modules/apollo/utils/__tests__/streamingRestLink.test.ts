import { StreamingRestLink } from '@/apollo/utils/streamingRestLink';
import { gql } from '@apollo/client';
import {
  Observable,
  type FetchResult,
  type Operation,
} from '@apollo/client/core';
import { vi } from 'vitest';

global.fetch = vi.fn();
describe('StreamingRestLink', () => {
  let streamingLink: StreamingRestLink;
  let mockForward: (operation: Operation) => Observable<FetchResult>;
  let forwardResult: Observable<FetchResult>;

  beforeEach(() => {
    streamingLink = new StreamingRestLink({
      uri: 'https://api.example.com',
    });
    const mockFn = vi.fn();
    forwardResult = new Observable(() => {});
    mockFn.mockImplementation(
      (_operation: Operation): Observable<FetchResult> => {
        return forwardResult;
      },
    );
    mockForward = mockFn;
    vi.mocked(global.fetch).mockClear();
  });

  describe('request', () => {
    it('should forward operations without @stream directive', () => {
      const operation = {
        query: gql`
          query Test {
            test
          }
        `,
        variables: {},
        getContext: () => ({}),
      } as Operation;

      const result = streamingLink.request(operation, mockForward);

      expect(mockForward).toHaveBeenCalledWith(operation);
      expect(result).toBe(forwardResult);
    });

    it('should handle operations with @stream directive', async () => {
      const operation = {
        query: gql`
          query StreamTest($threadId: String!) {
            streamChatResponse(threadId: $threadId)
              @stream(
                path: "/agent-chat/stream/{args.threadId}"
                method: "POST"
                bodyKey: "requestBody"
              )
          }
        `,
        variables: { threadId: '123', requestBody: { threadId: '123' } },
        getContext: () => ({ onChunk: vi.fn() }),
        operationName: 'StreamTest',
        extensions: {},
        setContext: vi.fn(),
      } as Operation;

      const mockReadableStream = new ReadableStream({
        start: (controller) => {
          controller.close();
        },
      });
      const mockResponse = new Response(mockReadableStream, {
        status: 200,
        statusText: 'OK',
      });
      Object.defineProperty(mockResponse.body, 'getReader', {
        value: () => ({
          read: vi.fn().mockResolvedValue({ done: true }),
          releaseLock: vi.fn(),
        }),
      });
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      const observable = streamingLink.request(operation, mockForward);
      const observer = {
        next: vi.fn(),
        error: vi.fn(),
        complete: vi.fn(),
      };

      observable.subscribe(observer);

      expect(mockForward).not.toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/agent-chat/stream/123',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          }),
          body: JSON.stringify({ threadId: '123' }),
        }),
      );
    });

    it('should handle network errors', async () => {
      const operation = {
        query: gql`
          query StreamTest {
            test @stream(path: "/stream", method: "GET")
          }
        `,
        variables: {},
        getContext: () => ({}),
      } as Operation;

      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const observable = streamingLink.request(operation, mockForward);
      const observer = {
        next: vi.fn(),
        error: vi.fn(),
        complete: vi.fn(),
      };

      observable.subscribe(observer);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(observer.error).toHaveBeenCalledWith(new Error('Network error'));
    });

    it('should handle non-ok responses', async () => {
      const operation = {
        query: gql`
          query StreamTest {
            test @stream(path: "/stream", method: "GET")
          }
        `,
        variables: {},
        getContext: () => ({}),
      } as Operation;

      const mockResponse = new Response(null, {
        status: 404,
        statusText: 'Not Found',
      });
      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      const observable = streamingLink.request(operation, mockForward);
      const observer = {
        next: vi.fn(),
        error: vi.fn(),
        complete: vi.fn(),
      };

      observable.subscribe(observer);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(observer.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'HTTP error! status: 404',
          statusCode: 404,
        }),
      );
    });
  });

  describe('extractStreamDirective', () => {
    it('should extract directive arguments correctly', () => {
      const operation = {
        query: gql`
          query Test($threadId: String!) {
            streamChatResponse(threadId: $threadId)
              @stream(
                path: "/agent-chat/stream/{args.threadId}"
                method: "POST"
                bodyKey: "requestBody"
                type: "StreamChatResponse"
              )
          }
        `,
        variables: {},
        getContext: () => ({}),
      } as Operation;

      const directive = (streamingLink as any).extractStreamDirective(
        operation,
      );

      expect(directive).toEqual({
        path: '/agent-chat/stream/{args.threadId}',
        method: 'POST',
        bodyKey: 'requestBody',
        type: 'StreamChatResponse',
      });
    });

    it('should return null for operations without @stream directive', () => {
      const operation = {
        query: gql`
          query Test {
            test
          }
        `,
        variables: {},
        getContext: () => ({}),
      } as Operation;

      const directive = (streamingLink as any).extractStreamDirective(
        operation,
      );

      expect(directive).toBeNull();
    });
  });

  describe('buildUrl', () => {
    it('should build URL with variable substitution', () => {
      const operation = {
        variables: { threadId: '123' },
        query: gql`
          query Test {
            test
          }
        `,
        operationName: 'Test',
        extensions: {},
        setContext: vi.fn(),
        getContext: () => ({}),
      } as unknown as Operation;

      const directive = {
        path: '/agent-chat/stream/{args.threadId}',
      };

      const url = (streamingLink as any).buildUrl({
        streamDirective: directive,
        operation,
      });

      expect(url).toBe('https://api.example.com/agent-chat/stream/123');
    });

    it('should use uri from context if provided', () => {
      const url = (streamingLink as any).buildUrl({
        uri: 'https://custom.example.com/api',
      });

      expect(url).toBe('https://custom.example.com/api');
    });
  });
});
