import { gql } from '@apollo/client';
import { type Operation } from '@apollo/client/core';
import { StreamingRestLink } from '@/apollo/utils/streamingRestLink';

global.fetch = jest.fn();
describe('StreamingRestLink', () => {
  let streamingLink: StreamingRestLink;
  let mockForward: jest.MockedFunction<(operation: Operation) => any>;

  beforeEach(() => {
    streamingLink = new StreamingRestLink({
      uri: 'https://api.example.com',
    });
    mockForward = jest.fn();
    (global.fetch as jest.Mock).mockClear();
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
      expect(result).toBe(mockForward(operation));
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
        getContext: () => ({ onChunk: jest.fn() }),
        operationName: 'StreamTest',
        extensions: {},
        setContext: jest.fn(),
      } as Operation;

      const mockResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: jest.fn().mockResolvedValue({ done: true }),
            releaseLock: jest.fn(),
          }),
        },
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const observable = streamingLink.request(operation, mockForward);
      const observer = {
        next: jest.fn(),
        error: jest.fn(),
        complete: jest.fn(),
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

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const observable = streamingLink.request(operation, mockForward);
      const observer = {
        next: jest.fn(),
        error: jest.fn(),
        complete: jest.fn(),
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

      const mockResponse = { ok: false, status: 404 };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const observable = streamingLink.request(operation, mockForward);
      const observer = {
        next: jest.fn(),
        error: jest.fn(),
        complete: jest.fn(),
      };

      observable.subscribe(observer);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(observer.error).toHaveBeenCalledWith(
        new Error('HTTP error! status: 404'),
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
        setContext: jest.fn(),
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
