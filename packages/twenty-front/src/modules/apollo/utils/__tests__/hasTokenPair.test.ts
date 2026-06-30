import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { hasTokenPair } from '@/apollo/utils/hasTokenPair';

jest.mock('../getTokenPair');

const mockGetTokenPair = getTokenPair as jest.MockedFunction<
  typeof getTokenPair
>;

describe('hasTokenPair', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when getTokenPair returns a valid token pair', () => {
    it('should return true for a complete valid token pair', () => {
      const validTokenPair = {
        accessOrWorkspaceAgnosticToken: {
          token: 'valid-access-token',
          expiresAt: '2024-01-01T00:00:00Z',
        },
        refreshToken: {
          token: 'valid-refresh-token',
          expiresAt: '2024-01-02T00:00:00Z',
        },
      };
      mockGetTokenPair.mockReturnValue(validTokenPair);

      const result = hasTokenPair();

      expect(result).toBe(true);
      expect(mockGetTokenPair).toHaveBeenCalledTimes(1);
    });

    it('should return true for a minimal valid token pair', () => {
      const minimalTokenPair = {
        accessOrWorkspaceAgnosticToken: {
          token: 'minimal-token',
          expiresAt: '2024-01-01T00:00:00Z',
        },
        refreshToken: {
          token: 'refresh-token',
          expiresAt: '2024-01-02T00:00:00Z',
        },
      };
      mockGetTokenPair.mockReturnValue(minimalTokenPair);

      const result = hasTokenPair();

      expect(result).toBe(true);
      expect(mockGetTokenPair).toHaveBeenCalledTimes(1);
    });

    it('should return true even if token pair has extra fields', () => {
      const tokenPairWithExtras = {
        accessOrWorkspaceAgnosticToken: {
          token: 'access-token',
          expiresAt: '2024-01-01T00:00:00Z',
          customField: 'custom-value',
        },
        refreshToken: {
          token: 'refresh-token',
          expiresAt: '2024-01-02T00:00:00Z',
        },
        extraField: 'extra-value',
      };
      mockGetTokenPair.mockReturnValue(tokenPairWithExtras);

      const result = hasTokenPair();

      expect(result).toBe(true);
      expect(mockGetTokenPair).toHaveBeenCalledTimes(1);
    });
  });

  describe('when getTokenPair returns undefined', () => {
    it('should return false when no token pair exists', () => {
      mockGetTokenPair.mockReturnValue(undefined);

      const result = hasTokenPair();

      expect(result).toBe(false);
      expect(mockGetTokenPair).toHaveBeenCalledTimes(1);
    });
  });

  describe('validation behavior', () => {
    it('should rely on getTokenPair for all validation logic', () => {
      // Test that hasTokenPair doesn't do its own validation
      // and trusts getTokenPair's validation completely
      mockGetTokenPair.mockReturnValue(undefined);

      hasTokenPair();

      expect(mockGetTokenPair).toHaveBeenCalledTimes(1);

      // Reset and test with valid token
      mockGetTokenPair.mockClear();
      const validToken = {
        accessOrWorkspaceAgnosticToken: {
          token: 'valid-token',
          expiresAt: '2024-01-01T00:00:00Z',
        },
        refreshToken: {
          token: 'refresh-token',
          expiresAt: '2024-01-02T00:00:00Z',
        },
      };
      mockGetTokenPair.mockReturnValue(validToken);

      const result = hasTokenPair();

      expect(result).toBe(true);
      expect(mockGetTokenPair).toHaveBeenCalledTimes(1);
    });

    it('should not perform additional validation beyond getTokenPair', () => {
      // This test ensures hasTokenPair doesn't duplicate validation logic
      const tokenPair = {
        accessOrWorkspaceAgnosticToken: {
          token: 'any-token-that-getTokenPair-considers-valid',
          expiresAt: '2024-01-01T00:00:00Z',
        },
        refreshToken: {
          token: 'refresh-token',
          expiresAt: '2024-01-02T00:00:00Z',
        },
      };
      mockGetTokenPair.mockReturnValue(tokenPair);

      const result = hasTokenPair();

      expect(result).toBe(true);
      // Should only call getTokenPair once, no additional validation
      expect(mockGetTokenPair).toHaveBeenCalledTimes(1);
    });
  });

  describe('multiple calls', () => {
    it('should call getTokenPair on each invocation', () => {
      const tokenPair = {
        accessOrWorkspaceAgnosticToken: {
          token: 'test-token',
          expiresAt: '2024-01-01T00:00:00Z',
        },
        refreshToken: {
          token: 'refresh-token',
          expiresAt: '2024-01-02T00:00:00Z',
        },
      };
      mockGetTokenPair.mockReturnValue(tokenPair);

      hasTokenPair();
      hasTokenPair();
      hasTokenPair();

      expect(mockGetTokenPair).toHaveBeenCalledTimes(3);
    });

    it('should return consistent results for consistent getTokenPair results', () => {
      const tokenPair = {
        accessOrWorkspaceAgnosticToken: {
          token: 'consistent-token',
          expiresAt: '2024-01-01T00:00:00Z',
        },
        refreshToken: {
          token: 'refresh-token',
          expiresAt: '2024-01-02T00:00:00Z',
        },
      };
      mockGetTokenPair.mockReturnValue(tokenPair);

      const result1 = hasTokenPair();
      const result2 = hasTokenPair();
      const result3 = hasTokenPair();

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });
  });
});
