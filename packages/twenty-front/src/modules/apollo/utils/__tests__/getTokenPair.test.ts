import { cookieStorage } from '~/utils/cookie-storage';
import { getTokenPair } from '@/apollo/utils/getTokenPair';

jest.mock('~/utils/cookie-storage', () => ({
  cookieStorage: {
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const mockCookieStorage = cookieStorage as jest.Mocked<typeof cookieStorage>;

describe('getTokenPair', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when tokenPair cookie does not exist', () => {
    it('should return undefined when cookie is not set', () => {
      mockCookieStorage.getItem.mockReturnValue(undefined);

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(mockCookieStorage.getItem).toHaveBeenCalledWith('tokenPair');
    });

    it('should return undefined when cookie is undefined', () => {
      mockCookieStorage.getItem.mockReturnValue(undefined);

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(mockCookieStorage.getItem).toHaveBeenCalledWith('tokenPair');
    });
  });

  describe('when tokenPair cookie has invalid JSON', () => {
    it('should remove cookie and return undefined for malformed JSON', () => {
      mockCookieStorage.getItem.mockReturnValue('invalid-json');

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(mockCookieStorage.removeItem).toHaveBeenCalledWith('tokenPair');
    });

    it('should remove cookie and return undefined for partial JSON', () => {
      mockCookieStorage.getItem.mockReturnValue('{"incomplete":');

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(mockCookieStorage.removeItem).toHaveBeenCalledWith('tokenPair');
    });
  });

  describe('when tokenPair cookie has invalid structure', () => {
    it('should remove cookie and return undefined when tokenPair is null', () => {
      mockCookieStorage.getItem.mockReturnValue('null');

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(mockCookieStorage.removeItem).toHaveBeenCalledWith('tokenPair');
    });

    it('should remove cookie and return undefined when tokenPair is not an object', () => {
      mockCookieStorage.getItem.mockReturnValue('"string-value"');

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(mockCookieStorage.removeItem).toHaveBeenCalledWith('tokenPair');
    });

    it('should remove cookie and return undefined when accessOrWorkspaceAgnosticToken is missing', () => {
      const invalidTokenPair = {
        refreshToken: { token: 'refresh-token' },
      };
      mockCookieStorage.getItem.mockReturnValue(
        JSON.stringify(invalidTokenPair),
      );

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(mockCookieStorage.removeItem).toHaveBeenCalledWith('tokenPair');
    });

    it('should remove cookie and return undefined when accessOrWorkspaceAgnosticToken is not an object', () => {
      const invalidTokenPair = {
        accessOrWorkspaceAgnosticToken: 'not-an-object',
        refreshToken: { token: 'refresh-token' },
      };
      mockCookieStorage.getItem.mockReturnValue(
        JSON.stringify(invalidTokenPair),
      );

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(mockCookieStorage.removeItem).toHaveBeenCalledWith('tokenPair');
    });

    it('should remove cookie and return undefined when token is missing', () => {
      const invalidTokenPair = {
        accessOrWorkspaceAgnosticToken: {
          expiresAt: '2024-01-01T00:00:00Z',
        },
        refreshToken: { token: 'refresh-token' },
      };
      mockCookieStorage.getItem.mockReturnValue(
        JSON.stringify(invalidTokenPair),
      );

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(mockCookieStorage.removeItem).toHaveBeenCalledWith('tokenPair');
    });

    it('should remove cookie and return undefined when token is not a string', () => {
      const invalidTokenPair = {
        accessOrWorkspaceAgnosticToken: {
          token: 123,
          expiresAt: '2024-01-01T00:00:00Z',
        },
        refreshToken: { token: 'refresh-token' },
      };
      mockCookieStorage.getItem.mockReturnValue(
        JSON.stringify(invalidTokenPair),
      );

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(mockCookieStorage.removeItem).toHaveBeenCalledWith('tokenPair');
    });

    it('should accept empty string token as valid', () => {
      const validTokenPair = {
        accessOrWorkspaceAgnosticToken: {
          token: '',
          expiresAt: '2024-01-01T00:00:00Z',
        },
        refreshToken: { token: 'refresh-token' },
      };
      mockCookieStorage.getItem.mockReturnValue(JSON.stringify(validTokenPair));

      const result = getTokenPair();

      expect(result).toEqual(validTokenPair);
      expect(mockCookieStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('when tokenPair cookie has valid structure', () => {
    it('should return valid tokenPair with all required fields', () => {
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
      mockCookieStorage.getItem.mockReturnValue(JSON.stringify(validTokenPair));

      const result = getTokenPair();

      expect(result).toEqual(validTokenPair);
      expect(mockCookieStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should return valid tokenPair with minimal required fields', () => {
      const validTokenPair = {
        accessOrWorkspaceAgnosticToken: {
          token: 'minimal-access-token',
        },
      };
      mockCookieStorage.getItem.mockReturnValue(JSON.stringify(validTokenPair));

      const result = getTokenPair();

      expect(result).toEqual(validTokenPair);
      expect(mockCookieStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should return valid tokenPair with extra fields', () => {
      const validTokenPair = {
        accessOrWorkspaceAgnosticToken: {
          token: 'access-token-with-extras',
          expiresAt: '2024-01-01T00:00:00Z',
          extraField: 'extra-value',
        },
        refreshToken: {
          token: 'refresh-token',
        },
        additionalField: 'additional-value',
      };
      mockCookieStorage.getItem.mockReturnValue(JSON.stringify(validTokenPair));

      const result = getTokenPair();

      expect(result).toEqual(validTokenPair);
      expect(mockCookieStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle JSON parsing error gracefully', () => {
      mockCookieStorage.getItem.mockReturnValue('{"valid": "json"');
      // Simulate JSON.parse throwing an error
      const originalParse = JSON.parse;
      JSON.parse = jest.fn(() => {
        throw new SyntaxError('Unexpected end of JSON input');
      });

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(mockCookieStorage.removeItem).toHaveBeenCalledWith('tokenPair');

      // Restore original JSON.parse
      JSON.parse = originalParse;
    });

    it('should handle very long token strings', () => {
      const longToken = 'a'.repeat(10000);
      const validTokenPair = {
        accessOrWorkspaceAgnosticToken: {
          token: longToken,
        },
      };
      mockCookieStorage.getItem.mockReturnValue(JSON.stringify(validTokenPair));

      const result = getTokenPair();

      expect(result).toEqual(validTokenPair);
      expect(result?.accessOrWorkspaceAgnosticToken.token).toHaveLength(10000);
    });

    it('should handle unicode characters in token', () => {
      const unicodeToken = 'token-with-unicode-🚀-characters-∑';
      const validTokenPair = {
        accessOrWorkspaceAgnosticToken: {
          token: unicodeToken,
        },
      };
      mockCookieStorage.getItem.mockReturnValue(JSON.stringify(validTokenPair));

      const result = getTokenPair();

      expect(result).toEqual(validTokenPair);
      expect(result?.accessOrWorkspaceAgnosticToken.token).toBe(unicodeToken);
    });
  });
});
