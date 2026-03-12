/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import {
  ConfigVariableException,
  ConfigVariableExceptionCode,
} from 'src/engine/core-modules/twenty-config/twenty-config.exception';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const mockCryptoVerify = jest.fn();

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  verify: (...args: unknown[]) => mockCryptoVerify(...args),
}));

const createFakeJwt = (payload: Record<string, unknown>): string => {
  const header = Buffer.from(
    JSON.stringify({ alg: 'RS256', typ: 'JWT' }),
  ).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = Buffer.from('fake-signature').toString('base64url');

  return `${header}.${body}.${signature}`;
};

const MOCK_API_URL = 'https://enterprise.example.com';
const FUTURE_TIMESTAMP = Math.floor(Date.now() / 1000) + 3600;
const PAST_TIMESTAMP = Math.floor(Date.now() / 1000) - 3600;

const MOCK_KEY_PAYLOAD = {
  sub: 'sub-123',
  licensee: 'ACME Corp',
  iat: 1000,
};

const MOCK_VALIDITY_PAYLOAD = {
  sub: 'sub-123',
  status: 'valid',
  iat: 1000,
  exp: FUTURE_TIMESTAMP,
};

const MOCK_EXPIRED_VALIDITY_PAYLOAD = {
  sub: 'sub-123',
  status: 'valid',
  iat: 1000,
  exp: PAST_TIMESTAMP,
};

describe('EnterprisePlanService', () => {
  let service: EnterprisePlanService;

  const configGetMock = jest.fn();
  const configSetMock = jest.fn();
  const appTokenFindOneMock = jest.fn();
  const transactionMock = jest.fn();
  const fetchMock = jest.fn();

  let originalFetch: typeof global.fetch;

  const setupEnterpriseKey = (key?: string) => {
    configGetMock.mockImplementation((configKey: string) => {
      if (configKey === 'ENTERPRISE_KEY') return key;
      if (configKey === 'ENTERPRISE_API_URL') return MOCK_API_URL;

      return undefined;
    });
  };

  const setupValidState = async (
    overrides: {
      keyPayload?: Record<string, unknown>;
      validityPayload?: Record<string, unknown>;
      cryptoVerifyResult?: boolean;
    } = {},
  ) => {
    const {
      keyPayload = MOCK_KEY_PAYLOAD,
      validityPayload = MOCK_VALIDITY_PAYLOAD,
      cryptoVerifyResult = true,
    } = overrides;

    const fakeKey = createFakeJwt(keyPayload);
    const fakeValidityToken = createFakeJwt(validityPayload);

    setupEnterpriseKey(fakeKey);
    mockCryptoVerify.mockReturnValue(cryptoVerifyResult);
    appTokenFindOneMock.mockResolvedValue({ value: fakeValidityToken });

    await service.onModuleInit();
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    originalFetch = global.fetch;
    global.fetch = fetchMock as unknown as typeof fetch;

    configGetMock.mockImplementation((key: string) => {
      if (key === 'ENTERPRISE_API_URL') return MOCK_API_URL;

      return undefined;
    });

    appTokenFindOneMock.mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnterprisePlanService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: configGetMock,
            set: configSetMock,
          },
        },
        {
          provide: getRepositoryToken(AppTokenEntity),
          useValue: {
            findOne: appTokenFindOneMock,
            target: AppTokenEntity,
            manager: {
              transaction: transactionMock,
            },
          },
        },
      ],
    }).compile();

    service = module.get<EnterprisePlanService>(EnterprisePlanService);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should populate caches when enterprise key and validity token exist', async () => {
      await setupValidState();

      expect(service.hasValidSignedEnterpriseKey()).toBe(true);
      expect(service.hasValidEnterpriseValidityToken()).toBe(true);
    });

    it('should handle missing enterprise key', async () => {
      setupEnterpriseKey(undefined);
      appTokenFindOneMock.mockResolvedValue(null);

      await service.onModuleInit();

      expect(service.hasValidSignedEnterpriseKey()).toBe(false);
      expect(service.hasValidEnterpriseValidityToken()).toBe(false);
    });

    it('should handle DB error when loading validity token', async () => {
      setupEnterpriseKey(createFakeJwt(MOCK_KEY_PAYLOAD));
      mockCryptoVerify.mockReturnValue(true);
      appTokenFindOneMock.mockRejectedValue(new Error('DB connection failed'));

      await service.onModuleInit();

      expect(service.hasValidSignedEnterpriseKey()).toBe(true);
      expect(service.hasValidEnterpriseValidityToken()).toBe(false);
    });

    it('should fall back to ENTERPRISE_VALIDITY_TOKEN config when DB has no token', async () => {
      const fakeKey = createFakeJwt(MOCK_KEY_PAYLOAD);
      const fakeValidityToken = createFakeJwt(MOCK_VALIDITY_PAYLOAD);

      configGetMock.mockImplementation((key: string) => {
        if (key === 'ENTERPRISE_KEY') return fakeKey;
        if (key === 'ENTERPRISE_API_URL') return MOCK_API_URL;
        if (key === 'ENTERPRISE_VALIDITY_TOKEN') return fakeValidityToken;

        return undefined;
      });
      mockCryptoVerify.mockReturnValue(true);
      appTokenFindOneMock.mockResolvedValue(null);

      await service.onModuleInit();

      expect(service.hasValidEnterpriseValidityToken()).toBe(true);
    });

    it('should prefer DB token over ENTERPRISE_VALIDITY_TOKEN config', async () => {
      const fakeKey = createFakeJwt(MOCK_KEY_PAYLOAD);
      const dbToken = createFakeJwt(MOCK_VALIDITY_PAYLOAD);
      const envToken = createFakeJwt(MOCK_EXPIRED_VALIDITY_PAYLOAD);

      configGetMock.mockImplementation((key: string) => {
        if (key === 'ENTERPRISE_KEY') return fakeKey;
        if (key === 'ENTERPRISE_API_URL') return MOCK_API_URL;
        if (key === 'ENTERPRISE_VALIDITY_TOKEN') return envToken;

        return undefined;
      });
      mockCryptoVerify.mockReturnValue(true);
      appTokenFindOneMock.mockResolvedValue({ value: dbToken });

      await service.onModuleInit();

      expect(service.hasValidEnterpriseValidityToken()).toBe(true);
    });

    it('should reject validity token with non-valid status', async () => {
      const invalidStatusPayload = {
        ...MOCK_VALIDITY_PAYLOAD,
        status: 'revoked',
      };

      setupEnterpriseKey(createFakeJwt(MOCK_KEY_PAYLOAD));
      mockCryptoVerify.mockReturnValue(true);
      appTokenFindOneMock.mockResolvedValue({
        value: createFakeJwt(invalidStatusPayload),
      });

      await service.onModuleInit();

      expect(service.hasValidEnterpriseValidityToken()).toBe(false);
    });
  });

  describe('hasValidSignedEnterpriseKey', () => {
    it('should return false when no enterprise key is configured', async () => {
      setupEnterpriseKey(undefined);
      await service.onModuleInit();

      expect(service.hasValidSignedEnterpriseKey()).toBe(false);
    });

    it('should return true when key has valid signature', async () => {
      setupEnterpriseKey(createFakeJwt(MOCK_KEY_PAYLOAD));
      mockCryptoVerify.mockReturnValue(true);
      await service.onModuleInit();

      expect(service.hasValidSignedEnterpriseKey()).toBe(true);
    });

    it('should return false when key has invalid signature', async () => {
      setupEnterpriseKey(createFakeJwt(MOCK_KEY_PAYLOAD));
      mockCryptoVerify.mockReturnValue(false);
      await service.onModuleInit();

      expect(service.hasValidSignedEnterpriseKey()).toBe(false);
    });

    it('should return false when key is not a valid JWT format', async () => {
      setupEnterpriseKey('not-a-jwt');
      await service.onModuleInit();

      expect(service.hasValidSignedEnterpriseKey()).toBe(false);
    });
  });

  describe('hasValidEnterpriseValidityToken', () => {
    it('should return false when no validity token exists', async () => {
      setupEnterpriseKey(undefined);
      appTokenFindOneMock.mockResolvedValue(null);
      await service.onModuleInit();

      expect(service.hasValidEnterpriseValidityToken()).toBe(false);
    });

    it('should return true when validity token is valid and not expired', async () => {
      await setupValidState();

      expect(service.hasValidEnterpriseValidityToken()).toBe(true);
    });

    it('should return false when validity token is expired', async () => {
      await setupValidState({
        validityPayload: MOCK_EXPIRED_VALIDITY_PAYLOAD,
      });

      expect(service.hasValidEnterpriseValidityToken()).toBe(false);
    });
  });

  describe('hasValidEnterpriseKey', () => {
    it('should return true when signed enterprise key is valid', async () => {
      await setupValidState();

      expect(service.hasValidEnterpriseKey()).toBe(true);
    });

    it('should return true with legacy unsigned key as fallback', async () => {
      setupEnterpriseKey('some-legacy-key');
      mockCryptoVerify.mockReturnValue(false);
      appTokenFindOneMock.mockResolvedValue(null);
      await service.onModuleInit();

      expect(service.hasValidSignedEnterpriseKey()).toBe(false);
      expect(service.hasValidEnterpriseKey()).toBe(true);
    });

    it('should return false when no key is configured', async () => {
      setupEnterpriseKey(undefined);
      await service.onModuleInit();

      expect(service.hasValidEnterpriseKey()).toBe(false);
    });
  });

  describe('isValid', () => {
    it('should return true when validity token is valid', async () => {
      await setupValidState();

      expect(service.isValid()).toBe(true);
    });

    it('should return true with legacy key as fallback', async () => {
      setupEnterpriseKey('some-legacy-key');
      mockCryptoVerify.mockReturnValue(false);
      appTokenFindOneMock.mockResolvedValue(null);
      await service.onModuleInit();

      expect(service.isValid()).toBe(true);
    });

    it('should return false when no key or token exists', async () => {
      setupEnterpriseKey(undefined);
      appTokenFindOneMock.mockResolvedValue(null);
      await service.onModuleInit();

      expect(service.isValid()).toBe(false);
    });
  });

  describe('isValidEnterpriseKeyFormat', () => {
    it('should return true for valid JWT format', () => {
      mockCryptoVerify.mockReturnValue(true);
      const validKey = createFakeJwt(MOCK_KEY_PAYLOAD);

      expect(service.isValidEnterpriseKeyFormat(validKey)).toBe(true);
    });

    it('should return false for invalid JWT format', () => {
      expect(service.isValidEnterpriseKeyFormat('not-a-jwt')).toBe(false);
    });

    it('should return false when signature verification fails', () => {
      mockCryptoVerify.mockReturnValue(false);
      const invalidKey = createFakeJwt(MOCK_KEY_PAYLOAD);

      expect(service.isValidEnterpriseKeyFormat(invalidKey)).toBe(false);
    });
  });

  describe('getLicenseInfo', () => {
    it('should return valid license info when validity token exists', async () => {
      await setupValidState();

      const licenseInfo = await service.getLicenseInfo();

      expect(licenseInfo).toEqual({
        isValid: true,
        licensee: 'ACME Corp',
        expiresAt: new Date(FUTURE_TIMESTAMP * 1000),
        subscriptionId: 'sub-123',
      });
    });

    it('should return expired license info when validity token is expired', async () => {
      await setupValidState({
        validityPayload: MOCK_EXPIRED_VALIDITY_PAYLOAD,
      });

      const licenseInfo = await service.getLicenseInfo();

      expect(licenseInfo).toEqual({
        isValid: false,
        licensee: 'ACME Corp',
        expiresAt: new Date(PAST_TIMESTAMP * 1000),
        subscriptionId: 'sub-123',
      });
    });

    it('should return legacy license info when only legacy key exists', async () => {
      setupEnterpriseKey('some-legacy-key');
      mockCryptoVerify.mockReturnValue(false);
      appTokenFindOneMock.mockResolvedValue(null);

      const licenseInfo = await service.getLicenseInfo();

      expect(licenseInfo).toEqual({
        isValid: true,
        licensee: null,
        expiresAt: null,
        subscriptionId: null,
      });
    });

    it('should return invalid license info when no key exists', async () => {
      setupEnterpriseKey(undefined);
      appTokenFindOneMock.mockResolvedValue(null);

      const licenseInfo = await service.getLicenseInfo();

      expect(licenseInfo).toEqual({
        isValid: false,
        licensee: null,
        expiresAt: null,
        subscriptionId: null,
      });
    });
  });

  describe('setEnterpriseKey', () => {
    it('should set the enterprise key via config service', async () => {
      configSetMock.mockResolvedValue(undefined);

      await service.setEnterpriseKey('new-enterprise-key');

      expect(configSetMock).toHaveBeenCalledWith(
        'ENTERPRISE_KEY',
        'new-enterprise-key',
      );
    });

    it('should throw specific error when DB config is disabled', async () => {
      configSetMock.mockRejectedValue(
        new ConfigVariableException(
          'Database config disabled',
          ConfigVariableExceptionCode.DATABASE_CONFIG_DISABLED,
        ),
      );

      await expect(service.setEnterpriseKey('key')).rejects.toThrow(
        'IS_CONFIG_VARIABLES_IN_DB_ENABLED is false on your server',
      );
    });

    it('should re-throw other errors', async () => {
      configSetMock.mockRejectedValue(new Error('Unexpected error'));

      await expect(service.setEnterpriseKey('key')).rejects.toThrow(
        'Unexpected error',
      );
    });
  });

  describe('refreshValidityToken', () => {
    it('should return false when no enterprise key is configured', async () => {
      setupEnterpriseKey(undefined);

      const result = await service.refreshValidityToken();

      expect(result).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should return false when key is not a valid signed JWT', async () => {
      setupEnterpriseKey('not-a-valid-jwt');

      const result = await service.refreshValidityToken();

      expect(result).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should refresh and return true when API call succeeds', async () => {
      const fakeKey = createFakeJwt(MOCK_KEY_PAYLOAD);
      const fakeValidityToken = createFakeJwt(MOCK_VALIDITY_PAYLOAD);

      setupEnterpriseKey(fakeKey);
      mockCryptoVerify.mockReturnValue(true);

      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ validityToken: fakeValidityToken }),
      });

      transactionMock.mockImplementation(
        async (callback: (manager: Record<string, jest.Mock>) => void) => {
          await callback({
            update: jest.fn(),
            save: jest.fn(),
          });
        },
      );

      appTokenFindOneMock.mockResolvedValue({ value: fakeValidityToken });

      const result = await service.refreshValidityToken();

      expect(result).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(`${MOCK_API_URL}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enterpriseKey: fakeKey }),
      });
    });

    it('should return false when API returns non-OK response', async () => {
      const fakeKey = createFakeJwt(MOCK_KEY_PAYLOAD);

      setupEnterpriseKey(fakeKey);
      mockCryptoVerify.mockReturnValue(true);

      fetchMock.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      const result = await service.refreshValidityToken();

      expect(result).toBe(false);
    });

    it('should return false when API response is missing validityToken', async () => {
      const fakeKey = createFakeJwt(MOCK_KEY_PAYLOAD);

      setupEnterpriseKey(fakeKey);
      mockCryptoVerify.mockReturnValue(true);

      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await service.refreshValidityToken();

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      const fakeKey = createFakeJwt(MOCK_KEY_PAYLOAD);

      setupEnterpriseKey(fakeKey);
      mockCryptoVerify.mockReturnValue(true);

      fetchMock.mockRejectedValue(new Error('Network error'));

      const result = await service.refreshValidityToken();

      expect(result).toBe(false);
    });
  });

  describe('reportSeats', () => {
    it('should return false when no enterprise key is configured', async () => {
      setupEnterpriseKey(undefined);

      const result = await service.reportSeats(10);

      expect(result).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should return false when key is not a valid signed JWT', async () => {
      setupEnterpriseKey('not-a-valid-jwt');
      appTokenFindOneMock.mockResolvedValue(null);
      await service.onModuleInit();

      const result = await service.reportSeats(10);

      expect(result).toBe(false);
    });

    it('should report seats and return true on success', async () => {
      await setupValidState();

      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await service.reportSeats(25);

      expect(result).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        `${MOCK_API_URL}/seats`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const callBody = JSON.parse(
        (fetchMock.mock.calls[0] as [string, { body: string }])[1].body,
      );

      expect(callBody.seatCount).toBe(25);
    });

    it('should return false when API returns non-OK response', async () => {
      await setupValidState();

      fetchMock.mockResolvedValue({ ok: false, status: 500 });

      const result = await service.reportSeats(10);

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      await setupValidState();

      fetchMock.mockRejectedValue(new Error('Connection refused'));

      const result = await service.reportSeats(10);

      expect(result).toBe(false);
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return null when no enterprise key is configured', async () => {
      setupEnterpriseKey(undefined);

      const result = await service.getSubscriptionStatus();

      expect(result).toBeNull();
    });

    it('should return subscription status on success', async () => {
      await setupValidState();

      const cancelAtTimestamp = Math.floor(Date.now() / 1000) + 86400;
      const periodEndTimestamp = Math.floor(Date.now() / 1000) + 2592000;

      fetchMock.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'active',
            cancelAt: cancelAtTimestamp,
            currentPeriodEnd: periodEndTimestamp,
            isCancellationScheduled: false,
          }),
      });

      const result = await service.getSubscriptionStatus();

      expect(result).toEqual({
        status: 'active',
        licensee: 'ACME Corp',
        expiresAt: new Date(FUTURE_TIMESTAMP * 1000),
        cancelAt: new Date(cancelAtTimestamp * 1000),
        currentPeriodEnd: new Date(periodEndTimestamp * 1000),
        isCancellationScheduled: false,
      });
    });

    it('should return null when API returns non-OK response', async () => {
      await setupValidState();

      fetchMock.mockResolvedValue({ ok: false, status: 500 });

      const result = await service.getSubscriptionStatus();

      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      await setupValidState();

      fetchMock.mockRejectedValue(new Error('Network error'));

      const result = await service.getSubscriptionStatus();

      expect(result).toBeNull();
    });

    it('should handle null cancelAt and currentPeriodEnd', async () => {
      await setupValidState();

      fetchMock.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'active',
            cancelAt: null,
            currentPeriodEnd: null,
          }),
      });

      const result = await service.getSubscriptionStatus();

      expect(result?.cancelAt).toBeNull();
      expect(result?.currentPeriodEnd).toBeNull();
      expect(result?.isCancellationScheduled).toBe(false);
    });
  });

  describe('getPortalUrl', () => {
    it('should return null when no API URL is configured', async () => {
      configGetMock.mockReturnValue(undefined);

      const result = await service.getPortalUrl();

      expect(result).toBeNull();
    });

    it('should return null when no valid enterprise key exists', async () => {
      setupEnterpriseKey(undefined);

      const result = await service.getPortalUrl();

      expect(result).toBeNull();
    });

    it('should return portal URL on success', async () => {
      await setupValidState();

      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ url: 'https://portal.example.com' }),
      });

      const result = await service.getPortalUrl('https://return.example.com');

      expect(result).toBe('https://portal.example.com');
      expect(fetchMock).toHaveBeenCalledWith(
        `${MOCK_API_URL}/portal`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('should return null when API fails', async () => {
      await setupValidState();

      fetchMock.mockResolvedValue({ ok: false, status: 500 });

      const result = await service.getPortalUrl();

      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      await setupValidState();

      fetchMock.mockRejectedValue(new Error('Network error'));

      const result = await service.getPortalUrl();

      expect(result).toBeNull();
    });
  });

  describe('getCheckoutUrl', () => {
    it('should return null when no API URL is configured', async () => {
      configGetMock.mockReturnValue(undefined);

      const result = await service.getCheckoutUrl('monthly', 5);

      expect(result).toBeNull();
    });

    it('should return checkout URL on success', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ url: 'https://checkout.example.com' }),
      });

      const result = await service.getCheckoutUrl('yearly', 10);

      expect(result).toBe('https://checkout.example.com');
      expect(fetchMock).toHaveBeenCalledWith(`${MOCK_API_URL}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingInterval: 'yearly', seatCount: 10 }),
      });
    });

    it('should return null when API fails', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 500 });

      const result = await service.getCheckoutUrl('monthly', 5);

      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      const result = await service.getCheckoutUrl('monthly', 5);

      expect(result).toBeNull();
    });

    it('should return null when API response has no url', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await service.getCheckoutUrl('monthly', 5);

      expect(result).toBeNull();
    });
  });
});
