import * as http from 'http';
import * as https from 'https';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

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
