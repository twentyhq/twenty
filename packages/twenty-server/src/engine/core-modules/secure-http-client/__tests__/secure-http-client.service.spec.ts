import * as http from 'http';
import * as https from 'https';

import axiosRetry from 'axios-retry';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

jest.mock('axios-retry', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@lifeomic/axios-fetch', () => ({
  buildAxiosFetch: jest.fn(() => jest.fn()),
}));

import { buildAxiosFetch } from '@lifeomic/axios-fetch';

const mockBuildAxiosFetch = jest.mocked(buildAxiosFetch);

jest.mock(
  'src/engine/core-modules/secure-http-client/utils/resolve-and-validate-hostname.util',
  () => ({
    resolveAndValidateHostname: jest.fn(),
  }),
);

import { resolveAndValidateHostname } from 'src/engine/core-modules/secure-http-client/utils/resolve-and-validate-hostname.util';

const mockResolveAndValidate = jest.mocked(resolveAndValidateHostname);

const createMockConfigService = (
  overrides: Record<string, unknown> = {},
): TwentyConfigService => {
  const defaults: Record<string, unknown> = {
    OUTBOUND_HTTP_SAFE_MODE_ENABLED: false,
  };
  const config = { ...defaults, ...overrides };

  return {
    get: jest.fn((key: string) => config[key]),
  } as unknown as TwentyConfigService;
};

describe('SecureHttpClientService', () => {
  describe('getHttpClient', () => {
    it('should return a plain axios instance when safe mode is off', () => {
      const service = new SecureHttpClientService(createMockConfigService());
      const client = service.getHttpClient();

      expect(client).toBeDefined();
      expect(client.defaults.httpAgent).toBeUndefined();
      expect(client.defaults.httpsAgent).toBeUndefined();
    });

    it('should return an axios instance with SSRF-safe agents when safe mode is on', () => {
      const service = new SecureHttpClientService(
        createMockConfigService({ OUTBOUND_HTTP_SAFE_MODE_ENABLED: true }),
      );
      const client = service.getHttpClient();

      expect(client).toBeDefined();
      expect(client.defaults.httpAgent).toBeInstanceOf(http.Agent);
      expect(client.defaults.httpsAgent).toBeInstanceOf(https.Agent);
    });

    it('should default maxRedirects to 5 when safe mode is on', () => {
      const service = new SecureHttpClientService(
        createMockConfigService({ OUTBOUND_HTTP_SAFE_MODE_ENABLED: true }),
      );
      const client = service.getHttpClient();

      expect(client.defaults.maxRedirects).toBe(5);
    });

    it('should cap maxRedirects when caller requests more', () => {
      const service = new SecureHttpClientService(
        createMockConfigService({ OUTBOUND_HTTP_SAFE_MODE_ENABLED: true }),
      );
      const client = service.getHttpClient({ maxRedirects: 100 });

      expect(client.defaults.maxRedirects).toBe(5);
    });

    it('should respect caller maxRedirects when lower than cap', () => {
      const service = new SecureHttpClientService(
        createMockConfigService({ OUTBOUND_HTTP_SAFE_MODE_ENABLED: true }),
      );
      const client = service.getHttpClient({ maxRedirects: 2 });

      expect(client.defaults.maxRedirects).toBe(2);
    });

    it('should not set maxRedirects when safe mode is off', () => {
      const service = new SecureHttpClientService(createMockConfigService());
      const client = service.getHttpClient();

      expect(client.defaults.maxRedirects).toBeUndefined();
    });

    it('should pass through axios config like baseURL', () => {
      const service = new SecureHttpClientService(createMockConfigService());
      const client = service.getHttpClient({
        baseURL: 'https://example.com/api',
      });

      expect(client.defaults.baseURL).toBe('https://example.com/api');
    });

    it('should configure axios-retry when retries is greater than 0', () => {
      jest.mocked(axiosRetry).mockClear();
      const service = new SecureHttpClientService(createMockConfigService());
      const client = service.getHttpClient({
        retries: 2,
        shouldResetTimeout: true,
      });

      expect(axiosRetry).toHaveBeenCalledWith(client, {
        retries: 2,
        shouldResetTimeout: true,
        retryCondition: expect.any(Function),
      });
    });

    it('should not configure axios-retry when retries is 0', () => {
      jest.mocked(axiosRetry).mockClear();
      const service = new SecureHttpClientService(createMockConfigService());

      service.getHttpClient({ retries: 0 });

      expect(axiosRetry).not.toHaveBeenCalled();
    });

    it('should not leak retry config into axios defaults', () => {
      const service = new SecureHttpClientService(createMockConfigService());
      const client = service.getHttpClient({
        retries: 2,
        shouldResetTimeout: true,
        baseURL: 'https://example.com',
      });

      expect(client.defaults.baseURL).toBe('https://example.com');
      expect(client.defaults).not.toHaveProperty('retries');
      expect(client.defaults).not.toHaveProperty('shouldResetTimeout');
    });
  });

  describe('getInternalHttpClient', () => {
    it('should return a plain axios instance regardless of safe mode', () => {
      const service = new SecureHttpClientService(
        createMockConfigService({ OUTBOUND_HTTP_SAFE_MODE_ENABLED: true }),
      );
      const client = service.getInternalHttpClient();

      expect(client).toBeDefined();
    });

    it('should pass through axios config like baseURL', () => {
      const service = new SecureHttpClientService(createMockConfigService());
      const client = service.getInternalHttpClient({
        baseURL: 'http://localhost:3000',
      });

      expect(client.defaults.baseURL).toBe('http://localhost:3000');
    });
  });

  describe('protocol validation interceptor', () => {
    it('should allow http URLs when safe mode is on', () => {
      const service = new SecureHttpClientService(
        createMockConfigService({ OUTBOUND_HTTP_SAFE_MODE_ENABLED: true }),
      );
      const client = service.getHttpClient();

      const interceptorHandlers = (
        client.interceptors.request as unknown as {
          handlers: Array<{ fulfilled: Function }>;
        }
      ).handlers;

      const protocolInterceptor = interceptorHandlers[0].fulfilled;

      expect(() =>
        protocolInterceptor({ url: 'http://example.com/api' }),
      ).not.toThrow();
    });

    it('should allow https URLs when safe mode is on', () => {
      const service = new SecureHttpClientService(
        createMockConfigService({ OUTBOUND_HTTP_SAFE_MODE_ENABLED: true }),
      );
      const client = service.getHttpClient();

      const interceptorHandlers = (
        client.interceptors.request as unknown as {
          handlers: Array<{ fulfilled: Function }>;
        }
      ).handlers;

      const protocolInterceptor = interceptorHandlers[0].fulfilled;

      expect(() =>
        protocolInterceptor({ url: 'https://example.com/api' }),
      ).not.toThrow();
    });

    it('should reject ftp URLs when safe mode is on', () => {
      const service = new SecureHttpClientService(
        createMockConfigService({ OUTBOUND_HTTP_SAFE_MODE_ENABLED: true }),
      );
      const client = service.getHttpClient();

      const interceptorHandlers = (
        client.interceptors.request as unknown as {
          handlers: Array<{ fulfilled: Function }>;
        }
      ).handlers;

      const protocolInterceptor = interceptorHandlers[0].fulfilled;

      expect(() =>
        protocolInterceptor({ url: 'ftp://internal-server/data' }),
      ).toThrow('Protocol ftp: is not allowed');
    });

    it('should reject file URLs when safe mode is on', () => {
      const service = new SecureHttpClientService(
        createMockConfigService({ OUTBOUND_HTTP_SAFE_MODE_ENABLED: true }),
      );
      const client = service.getHttpClient();

      const interceptorHandlers = (
        client.interceptors.request as unknown as {
          handlers: Array<{ fulfilled: Function }>;
        }
      ).handlers;

      const protocolInterceptor = interceptorHandlers[0].fulfilled;

      expect(() => protocolInterceptor({ url: 'file:///etc/passwd' })).toThrow(
        'Protocol file: is not allowed',
      );
    });

    it('should reject non-http baseURL when url is empty string', () => {
      const service = new SecureHttpClientService(
        createMockConfigService({ OUTBOUND_HTTP_SAFE_MODE_ENABLED: true }),
      );
      const client = service.getHttpClient();

      const interceptorHandlers = (
        client.interceptors.request as unknown as {
          handlers: Array<{ fulfilled: Function }>;
        }
      ).handlers;

      const protocolInterceptor = interceptorHandlers[0].fulfilled;

      expect(() =>
        protocolInterceptor({
          url: '',
          baseURL: 'ftp://internal-server/data',
        }),
      ).toThrow('Protocol ftp: is not allowed');
    });

    it('should not add protocol interceptor when safe mode is off', () => {
      const service = new SecureHttpClientService(createMockConfigService());
      const client = service.getHttpClient();

      const interceptorHandlers = (
        client.interceptors.request as unknown as {
          handlers: Array<{ fulfilled: Function }>;
        }
      ).handlers;

      expect(interceptorHandlers.length).toBe(0);
    });
  });

  describe('getValidatedHost', () => {
    it('should return the original hostname when safe mode is off', async () => {
      const service = new SecureHttpClientService(createMockConfigService());

      const result = await service.getValidatedHost(
        'https://caldav.icloud.com/principals/',
      );

      expect(result).toBe('https://caldav.icloud.com/principals/');
      expect(mockResolveAndValidate).not.toHaveBeenCalled();
    });

    it('should validate and return resolved IP when safe mode is on', async () => {
      mockResolveAndValidate.mockResolvedValue('17.248.239.66');
      const service = new SecureHttpClientService(
        createMockConfigService({ OUTBOUND_HTTP_SAFE_MODE_ENABLED: true }),
      );

      const result = await service.getValidatedHost(
        'https://caldav.icloud.com/principals/',
      );

      expect(mockResolveAndValidate).toHaveBeenCalledWith(
        'https://caldav.icloud.com/principals/',
      );
      expect(result).toBe('17.248.239.66');
    });

    it('should throw when hostname resolves to a private IP', async () => {
      mockResolveAndValidate.mockRejectedValue(
        new Error(
          'Connection to internal IP address 192.168.1.1 is not allowed.',
        ),
      );
      const service = new SecureHttpClientService(
        createMockConfigService({ OUTBOUND_HTTP_SAFE_MODE_ENABLED: true }),
      );

      await expect(
        service.getValidatedHost('https://my-local-server.local/'),
      ).rejects.toThrow('internal IP address');
    });
  });

  describe('createSsrfSafeFetch', () => {
    beforeEach(() => {
      mockBuildAxiosFetch.mockClear();
    });

    it('should return globalThis.fetch when safe mode is off', () => {
      const service = new SecureHttpClientService(createMockConfigService());

      const result = service.createSsrfSafeFetch();

      expect(result).toBe(globalThis.fetch);
      expect(mockBuildAxiosFetch).not.toHaveBeenCalled();
    });

    it('should wrap an SSRF-protected axios client when safe mode is on', () => {
      const service = new SecureHttpClientService(
        createMockConfigService({ OUTBOUND_HTTP_SAFE_MODE_ENABLED: true }),
      );

      service.createSsrfSafeFetch();

      expect(mockBuildAxiosFetch).toHaveBeenCalledTimes(1);
      const axiosClient = mockBuildAxiosFetch.mock.calls[0][0] as ReturnType<
        SecureHttpClientService['getHttpClient']
      >;

      expect(axiosClient.defaults.httpAgent).toBeInstanceOf(http.Agent);
      expect(axiosClient.defaults.httpsAgent).toBeInstanceOf(https.Agent);
    });
  });

  describe('logging interceptor', () => {
    it('should add a request interceptor when context is provided', () => {
      const service = new SecureHttpClientService(createMockConfigService());
      const client = service.getHttpClient(undefined, {
        workspaceId: 'ws-123',
        source: 'webhook',
      });

      const interceptorHandlers = (
        client.interceptors.request as unknown as {
          handlers: Array<{ fulfilled: Function }>;
        }
      ).handlers;

      expect(interceptorHandlers.length).toBe(1);
    });

    it('should not add a request interceptor when context is not provided', () => {
      const service = new SecureHttpClientService(createMockConfigService());
      const client = service.getHttpClient();

      const interceptorHandlers = (
        client.interceptors.request as unknown as {
          handlers: Array<{ fulfilled: Function }>;
        }
      ).handlers;

      expect(interceptorHandlers.length).toBe(0);
    });

    it('should pass config through the interceptor and return it', () => {
      const service = new SecureHttpClientService(createMockConfigService());
      const client = service.getHttpClient(undefined, {
        workspaceId: 'ws-456',
        source: 'workflow-http',
        userId: 'user-789',
      });

      const interceptorHandlers = (
        client.interceptors.request as unknown as {
          handlers: Array<{ fulfilled: Function }>;
        }
      ).handlers;

      const interceptorFn = interceptorHandlers[0].fulfilled;
      const mockConfig = { method: 'GET', url: 'https://example.com/api' };

      const result = interceptorFn(mockConfig);

      expect(result).toBe(mockConfig);
    });
  });
});
