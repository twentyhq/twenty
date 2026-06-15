import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { TOKEN_PAIR_LOCAL_STORAGE_KEY } from '@/auth/states/tokenPairState';

describe('getTokenPair', () => {
  let getItemSpy: jest.SpyInstance;
  let removeItemSpy: jest.SpyInstance;

  beforeEach(() => {
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
    removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when tokenPair is not stored', () => {
    it('should return undefined when nothing is stored', () => {
      getItemSpy.mockReturnValue(null);

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(getItemSpy).toHaveBeenCalledWith(TOKEN_PAIR_LOCAL_STORAGE_KEY);
    });
  });

  describe('when stored tokenPair has invalid JSON', () => {
    it('should remove the item and return undefined for malformed JSON', () => {
      getItemSpy.mockReturnValue('invalid-json');

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(removeItemSpy).toHaveBeenCalledWith(TOKEN_PAIR_LOCAL_STORAGE_KEY);
    });

    it('should remove the item and return undefined for partial JSON', () => {
      getItemSpy.mockReturnValue('{"incomplete":');

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(removeItemSpy).toHaveBeenCalledWith(TOKEN_PAIR_LOCAL_STORAGE_KEY);
    });
  });

  describe('when stored tokenPair has invalid structure', () => {
    it('should remove the item and return undefined when tokenPair is null', () => {
      getItemSpy.mockReturnValue('null');

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(removeItemSpy).toHaveBeenCalledWith(TOKEN_PAIR_LOCAL_STORAGE_KEY);
    });

    it('should remove the item and return undefined when tokenPair is not an object', () => {
      getItemSpy.mockReturnValue('"string-value"');

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(removeItemSpy).toHaveBeenCalledWith(TOKEN_PAIR_LOCAL_STORAGE_KEY);
    });

    it('should remove the item and return undefined when accessOrWorkspaceAgnosticToken is missing', () => {
      const invalidTokenPair = {
        refreshToken: { token: 'refresh-token' },
      };
      getItemSpy.mockReturnValue(JSON.stringify(invalidTokenPair));

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(removeItemSpy).toHaveBeenCalledWith(TOKEN_PAIR_LOCAL_STORAGE_KEY);
    });

    it('should remove the item and return undefined when accessOrWorkspaceAgnosticToken is not an object', () => {
      const invalidTokenPair = {
        accessOrWorkspaceAgnosticToken: 'not-an-object',
        refreshToken: { token: 'refresh-token' },
      };
      getItemSpy.mockReturnValue(JSON.stringify(invalidTokenPair));

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(removeItemSpy).toHaveBeenCalledWith(TOKEN_PAIR_LOCAL_STORAGE_KEY);
    });

    it('should remove the item and return undefined when token is missing', () => {
      const invalidTokenPair = {
        accessOrWorkspaceAgnosticToken: {
          expiresAt: '2024-01-01T00:00:00Z',
        },
        refreshToken: { token: 'refresh-token' },
      };
      getItemSpy.mockReturnValue(JSON.stringify(invalidTokenPair));

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(removeItemSpy).toHaveBeenCalledWith(TOKEN_PAIR_LOCAL_STORAGE_KEY);
    });

    it('should remove the item and return undefined when token is not a string', () => {
      const invalidTokenPair = {
        accessOrWorkspaceAgnosticToken: {
          token: 123,
          expiresAt: '2024-01-01T00:00:00Z',
        },
        refreshToken: { token: 'refresh-token' },
      };
      getItemSpy.mockReturnValue(JSON.stringify(invalidTokenPair));

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(removeItemSpy).toHaveBeenCalledWith(TOKEN_PAIR_LOCAL_STORAGE_KEY);
    });

    it('should accept empty string token as valid', () => {
      const validTokenPair = {
        accessOrWorkspaceAgnosticToken: {
          token: '',
          expiresAt: '2024-01-01T00:00:00Z',
        },
        refreshToken: { token: 'refresh-token' },
      };
      getItemSpy.mockReturnValue(JSON.stringify(validTokenPair));

      const result = getTokenPair();

      expect(result).toEqual(validTokenPair);
      expect(removeItemSpy).not.toHaveBeenCalled();
    });
  });

  describe('when stored tokenPair has valid structure', () => {
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
      getItemSpy.mockReturnValue(JSON.stringify(validTokenPair));

      const result = getTokenPair();

      expect(result).toEqual(validTokenPair);
      expect(removeItemSpy).not.toHaveBeenCalled();
    });

    it('should return valid tokenPair with minimal required fields', () => {
      const validTokenPair = {
        accessOrWorkspaceAgnosticToken: {
          token: 'minimal-access-token',
        },
      };
      getItemSpy.mockReturnValue(JSON.stringify(validTokenPair));

      const result = getTokenPair();

      expect(result).toEqual(validTokenPair);
      expect(removeItemSpy).not.toHaveBeenCalled();
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
      getItemSpy.mockReturnValue(JSON.stringify(validTokenPair));

      const result = getTokenPair();

      expect(result).toEqual(validTokenPair);
      expect(removeItemSpy).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle JSON parsing error gracefully', () => {
      getItemSpy.mockReturnValue('{"valid": "json"');
      const originalParse = JSON.parse;
      JSON.parse = jest.fn(() => {
        throw new SyntaxError('Unexpected end of JSON input');
      });

      const result = getTokenPair();

      expect(result).toBeUndefined();
      expect(removeItemSpy).toHaveBeenCalledWith(TOKEN_PAIR_LOCAL_STORAGE_KEY);

      JSON.parse = originalParse;
    });

    it('should handle very long token strings', () => {
      const longToken = 'a'.repeat(10000);
      const validTokenPair = {
        accessOrWorkspaceAgnosticToken: {
          token: longToken,
        },
      };
      getItemSpy.mockReturnValue(JSON.stringify(validTokenPair));

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
      getItemSpy.mockReturnValue(JSON.stringify(validTokenPair));

      const result = getTokenPair();

      expect(result).toEqual(validTokenPair);
      expect(result?.accessOrWorkspaceAgnosticToken.token).toBe(unicodeToken);
    });
  });
});
