import { clearClientConfigCache } from '../clientConfigCache';
import { getClientConfig } from '../getClientConfig';
import { refreshClientConfig } from '../refreshClientConfig';

import { REACT_APP_SERVER_BASE_URL } from '~/config';

global.fetch = jest.fn();

const mockClientConfig = {
  billing: {
    isBillingEnabled: true,
    billingUrl: 'https://billing.example.com',
    trialPeriods: [],
  },
  authProviders: {
    google: true,
    magicLink: false,
    password: true,
    microsoft: false,
    sso: [],
  },
  signInPrefilled: false,
  isMultiWorkspaceEnabled: true,
  isEmailVerificationRequired: false,
  defaultSubdomain: 'app',
  frontDomain: 'localhost',
  debugMode: true,
  support: {
    supportDriver: 'none',
    supportFrontChatId: undefined,
  },
  sentry: {
    environment: 'development',
    release: '1.0.0',
    dsn: undefined,
  },
  captcha: {
    provider: undefined,
    siteKey: undefined,
  },
  chromeExtensionId: undefined,
  api: {
    mutationMaximumAffectedRecords: 100,
  },
  isAttachmentPreviewEnabled: true,
  analyticsEnabled: false,
  canManageFeatureFlags: true,
  publicFeatureFlags: [],
  isMicrosoftMessagingEnabled: false,
  isMicrosoftCalendarEnabled: false,
  isGoogleMessagingEnabled: false,
  isGoogleCalendarEnabled: false,
  isConfigVariablesInDbEnabled: false,
};

describe('clientConfigUtils', () => {
  beforeEach(() => {
    clearClientConfigCache();
    jest.clearAllMocks();
  });

  afterEach(() => {
    clearClientConfigCache();
  });

  describe('getClientConfig', () => {
    it('should fetch client config from API', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockClientConfig,
      });

      const result = await getClientConfig();

      expect(fetch).toHaveBeenCalledWith(
        REACT_APP_SERVER_BASE_URL + '/client-config',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual(mockClientConfig);
    });

    it('should cache the result', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockClientConfig,
      });

      // First call
      await getClientConfig();

      // Second call should use cache
      const result = await getClientConfig();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockClientConfig);
    });

    it('should handle fetch errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(getClientConfig()).rejects.toThrow(
        'Failed to fetch client config: 500 Internal Server Error',
      );
    });
  });

  describe('refreshClientConfig', () => {
    it('should clear cache and fetch fresh data', async () => {
      // First call to populate cache
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockClientConfig,
      });
      await getClientConfig();

      // Mock a different response for refresh
      const updatedConfig = { ...mockClientConfig, debugMode: false };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedConfig,
      });

      const result = await refreshClientConfig();

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(updatedConfig);
    });
  });

  describe('clearClientConfigCache', () => {
    it('should clear the cache', async () => {
      // Populate cache
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockClientConfig,
      });
      await getClientConfig();

      // Clear cache
      clearClientConfigCache();

      // Next call should fetch again
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockClientConfig,
      });
      await getClientConfig();

      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
