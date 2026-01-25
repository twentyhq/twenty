import { renderHook } from '@testing-library/react';
import { createClient } from 'graphql-sse';
import { vi } from 'vitest';

import { useOnDbEvent } from '@/sse-db-event/hooks/useOnDbEvent';
import { DatabaseEventAction } from '~/generated/graphql';
import { getTokenPair } from '~/modules/apollo/utils/getTokenPair';

vi.mock('~/modules/apollo/utils/getTokenPair');
vi.mock('graphql-sse');

const mockGetTokenPair = vi.mocked(getTokenPair);
const mockCreateClient = vi.mocked(createClient);

// Mock environment variable
const mockServerBaseUrl = 'http://localhost:3000';
vi.mock('~/config', () => ({
  REACT_APP_SERVER_BASE_URL: 'http://localhost:3000',
}));

describe('useOnDbEvent', () => {
  const mockUnsubscribe = vi.fn();
  const mockClient = {
    subscribe: vi.fn(() => mockUnsubscribe),
    dispose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockReturnValue(mockClient as any);
  });

  describe('token safety checks', () => {
    it('should handle undefined tokenPair gracefully', () => {
      mockGetTokenPair.mockReturnValue(undefined);

      renderHook(() =>
        useOnDbEvent({
          input: {
            objectNameSingular: 'test',
            action: DatabaseEventAction.CREATED,
          },
          onData: vi.fn(),
        }),
      );

      expect(mockCreateClient).toHaveBeenCalledWith({
        url: `${mockServerBaseUrl}/graphql`,
        headers: {
          Authorization: '',
        },
      });
    });

    it('should handle tokenPair with undefined accessOrWorkspaceAgnosticToken gracefully', () => {
      mockGetTokenPair.mockReturnValue({
        accessOrWorkspaceAgnosticToken: undefined,
        refreshToken: {
          token: 'refresh-token',
          expiresAt: '2024-01-02T00:00:00Z',
        },
      } as any);

      renderHook(() =>
        useOnDbEvent({
          input: {
            objectNameSingular: 'test',
            action: DatabaseEventAction.CREATED,
          },
          onData: vi.fn(),
        }),
      );

      expect(mockCreateClient).toHaveBeenCalledWith({
        url: `${mockServerBaseUrl}/graphql`,
        headers: {
          Authorization: '',
        },
      });
    });

    it('should handle tokenPair with accessOrWorkspaceAgnosticToken but undefined token gracefully', () => {
      mockGetTokenPair.mockReturnValue({
        accessOrWorkspaceAgnosticToken: {
          token: undefined,
          expiresAt: '2024-01-01T00:00:00Z',
        },
        refreshToken: {
          token: 'refresh-token',
          expiresAt: '2024-01-02T00:00:00Z',
        },
      } as any);

      renderHook(() =>
        useOnDbEvent({
          input: {
            objectNameSingular: 'test',
            action: DatabaseEventAction.CREATED,
          },
          onData: vi.fn(),
        }),
      );

      expect(mockCreateClient).toHaveBeenCalledWith({
        url: `${mockServerBaseUrl}/graphql`,
        headers: {
          Authorization: '',
        },
      });
    });

    it('should handle tokenPair with null token gracefully', () => {
      mockGetTokenPair.mockReturnValue({
        accessOrWorkspaceAgnosticToken: {
          token: null,
          expiresAt: '2024-01-01T00:00:00Z',
        },
        refreshToken: {
          token: 'refresh-token',
          expiresAt: '2024-01-02T00:00:00Z',
        },
      } as any);

      renderHook(() =>
        useOnDbEvent({
          input: {
            objectNameSingular: 'test',
            action: DatabaseEventAction.CREATED,
          },
          onData: vi.fn(),
        }),
      );

      expect(mockCreateClient).toHaveBeenCalledWith({
        url: `${mockServerBaseUrl}/graphql`,
        headers: {
          Authorization: '',
        },
      });
    });

    it('should properly set authorization header when token is valid', () => {
      const validToken = 'valid-access-token';
      mockGetTokenPair.mockReturnValue({
        accessOrWorkspaceAgnosticToken: {
          token: validToken,
          expiresAt: '2024-01-01T00:00:00Z',
        },
        refreshToken: {
          token: 'refresh-token',
          expiresAt: '2024-01-02T00:00:00Z',
        },
      });

      renderHook(() =>
        useOnDbEvent({
          input: {
            objectNameSingular: 'test',
            action: DatabaseEventAction.CREATED,
          },
          onData: vi.fn(),
        }),
      );

      expect(mockCreateClient).toHaveBeenCalledWith({
        url: `${mockServerBaseUrl}/graphql`,
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
      });
    });

    it('should handle empty string token gracefully', () => {
      mockGetTokenPair.mockReturnValue({
        accessOrWorkspaceAgnosticToken: {
          token: '',
          expiresAt: '2024-01-01T00:00:00Z',
        },
        refreshToken: {
          token: 'refresh-token',
          expiresAt: '2024-01-02T00:00:00Z',
        },
      });

      renderHook(() =>
        useOnDbEvent({
          input: {
            objectNameSingular: 'test',
            action: DatabaseEventAction.CREATED,
          },
          onData: vi.fn(),
        }),
      );

      expect(mockCreateClient).toHaveBeenCalledWith({
        url: `${mockServerBaseUrl}/graphql`,
        headers: {
          Authorization: '',
        },
      });
    });
  });

  describe('basic functionality', () => {
    const validToken = 'test-token';

    beforeEach(() => {
      mockGetTokenPair.mockReturnValue({
        accessOrWorkspaceAgnosticToken: {
          token: validToken,
          expiresAt: '2024-01-01T00:00:00Z',
        },
        refreshToken: {
          token: 'refresh-token',
          expiresAt: '2024-01-02T00:00:00Z',
        },
      });
    });

    it('should create SSE client with correct URL and headers', () => {
      renderHook(() =>
        useOnDbEvent({
          input: {
            objectNameSingular: 'test',
            action: DatabaseEventAction.CREATED,
          },
          onData: vi.fn(),
        }),
      );

      expect(mockCreateClient).toHaveBeenCalledWith({
        url: `${mockServerBaseUrl}/graphql`,
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
      });
    });

    it('should not subscribe when skip is true', () => {
      renderHook(() =>
        useOnDbEvent({
          input: {
            objectNameSingular: 'test',
            action: DatabaseEventAction.CREATED,
          },
          onData: vi.fn(),
          skip: true,
        }),
      );

      expect(mockClient.subscribe).not.toHaveBeenCalled();
    });

    it('should subscribe when skip is false or undefined', () => {
      const mockOnData = vi.fn();

      renderHook(() =>
        useOnDbEvent({
          input: {
            objectNameSingular: 'test',
            action: DatabaseEventAction.CREATED,
          },
          onData: mockOnData,
          skip: false,
        }),
      );

      expect(mockClient.subscribe).toHaveBeenCalled();
    });

    it('should pass correct parameters to subscription', () => {
      const mockOnData = vi.fn();

      renderHook(() =>
        useOnDbEvent({
          input: {
            objectNameSingular: 'person',
            action: DatabaseEventAction.CREATED,
          },
          onData: mockOnData,
        }),
      );

      expect(mockClient.subscribe).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('subscription'),
        }),
        expect.objectContaining({
          next: expect.any(Function),
          error: expect.any(Function),
        }),
      );
    });
  });
});
