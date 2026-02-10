import * as http from 'http';
import * as https from 'https';

import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';

import { type SecureAdapterDependencies } from 'src/engine/core-modules/secure-http-client/utils/secure-adapter-dependencies.type';
import { getSecureAxiosAdapter } from 'src/engine/core-modules/secure-http-client/utils/get-secure-axios-adapter.util';

describe('getSecureAxiosAdapter', () => {
  let mockDnsLookup: jest.Mock;
  let mockHttpAdapter: jest.Mock;
  let dependencies: SecureAdapterDependencies;

  beforeEach(() => {
    mockDnsLookup = jest.fn();
    mockHttpAdapter = jest.fn().mockResolvedValue({ data: 'success' });
    dependencies = {
      dnsLookup: mockDnsLookup,
      httpAdapter: mockHttpAdapter,
    };
  });

  describe('URL validation', () => {
    it('should throw if URL is not provided', async () => {
      const adapter = getSecureAxiosAdapter(dependencies);
      const config = { url: undefined } as InternalAxiosRequestConfig;

      await expect(adapter(config)).rejects.toThrow('URL is required');
    });

    it('should throw for non-http/https protocols', async () => {
      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'file:///etc/passwd',
      } as InternalAxiosRequestConfig;

      await expect(adapter(config)).rejects.toThrow(
        'URL should use http/https protocol',
      );
    });

    it('should throw for ftp protocol', async () => {
      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'ftp://example.com/file',
      } as InternalAxiosRequestConfig;

      await expect(adapter(config)).rejects.toThrow(
        'URL should use http/https protocol',
      );
    });

    it('should allow http protocol', async () => {
      mockDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'http://example.com',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await adapter(config);

      expect(mockHttpAdapter).toHaveBeenCalled();
    });

    it('should allow https protocol', async () => {
      mockDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'https://example.com',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await adapter(config);

      expect(mockHttpAdapter).toHaveBeenCalled();
    });
  });

  describe('private IP blocking', () => {
    it('should block requests to 127.0.0.1', async () => {
      mockDnsLookup.mockResolvedValue({ address: '127.0.0.1', family: 4 });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'http://localhost',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await expect(adapter(config)).rejects.toThrow(
        'Request to internal IP address 127.0.0.1 is not allowed.',
      );
    });

    it('should block requests to 10.x.x.x range', async () => {
      mockDnsLookup.mockResolvedValue({ address: '10.0.0.1', family: 4 });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'http://internal.example.com',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await expect(adapter(config)).rejects.toThrow(
        'Request to internal IP address 10.0.0.1 is not allowed.',
      );
    });

    it('should block requests to 192.168.x.x range', async () => {
      mockDnsLookup.mockResolvedValue({ address: '192.168.1.1', family: 4 });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'http://router.local',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await expect(adapter(config)).rejects.toThrow(
        'Request to internal IP address 192.168.1.1 is not allowed.',
      );
    });

    it('should block requests to 172.16-31.x.x range', async () => {
      mockDnsLookup.mockResolvedValue({ address: '172.16.0.1', family: 4 });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'http://internal.corp',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await expect(adapter(config)).rejects.toThrow(
        'Request to internal IP address 172.16.0.1 is not allowed.',
      );
    });

    it('should block requests to cloud metadata endpoint (169.254.169.254)', async () => {
      mockDnsLookup.mockResolvedValue({
        address: '169.254.169.254',
        family: 4,
      });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'http://metadata.google.internal',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await expect(adapter(config)).rejects.toThrow(
        'Request to internal IP address 169.254.169.254 is not allowed.',
      );
    });
  });

  describe('DNS rebinding protection', () => {
    it('should preserve original hostname in URL for TLS validation', async () => {
      mockDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'https://example.com/api/data',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await adapter(config);

      expect(mockHttpAdapter).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://example.com/api/data',
        }),
      );
    });

    it('should set httpsAgent with custom lookup for HTTPS requests', async () => {
      mockDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'https://example.com/api/data',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await adapter(config);

      expect(config.httpsAgent).toBeInstanceOf(https.Agent);
      expect(config.httpAgent).toBeUndefined();
    });

    it('should set httpAgent with custom lookup for HTTP requests', async () => {
      mockDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'http://example.com/api/data',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await adapter(config);

      expect(config.httpAgent).toBeInstanceOf(http.Agent);
      expect(config.httpsAgent).toBeUndefined();
    });

    it('should use custom lookup that returns validated IP', async () => {
      mockDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'https://example.com/api/data',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await adapter(config);

      // Verify the agent's lookup returns our pre-validated IP
      const agent = config.httpsAgent as https.Agent;
      const lookupFn = (agent.options as { lookup?: Function }).lookup;

      expect(lookupFn).toBeDefined();

      const lookupResult = await new Promise<{
        address: string;
        family: number;
      }>((resolve) => {
        lookupFn!(
          'any-hostname',
          {},
          (err: unknown, address: string, family: number) => {
            resolve({ address, family });
          },
        );
      });

      expect(lookupResult.address).toBe('93.184.216.34');
      expect(lookupResult.family).toBe(4);
    });

    it('should handle IPv6 addresses correctly', async () => {
      mockDnsLookup.mockResolvedValue({
        address: '2001:4860:4860::8888',
        family: 6,
      });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'https://example.com/api/data',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await adapter(config);

      const agent = config.httpsAgent as https.Agent;
      const lookupFn = (agent.options as { lookup?: Function }).lookup;

      const lookupResult = await new Promise<{
        address: string;
        family: number;
      }>((resolve) => {
        lookupFn!(
          'any-hostname',
          {},
          (err: unknown, address: string, family: number) => {
            resolve({ address, family });
          },
        );
      });

      expect(lookupResult.address).toBe('2001:4860:4860::8888');
      expect(lookupResult.family).toBe(6);
    });

    it('should preserve query parameters in URL', async () => {
      mockDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'https://example.com/api?foo=bar&baz=qux',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await adapter(config);

      expect(mockHttpAdapter).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://example.com/api?foo=bar&baz=qux',
        }),
      );
    });

    it('should preserve port in URL', async () => {
      mockDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'https://example.com:8443/api',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await adapter(config);

      expect(mockHttpAdapter).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://example.com:8443/api',
        }),
      );
    });
  });

  describe('public IP allowlist', () => {
    it('should allow requests to public IP addresses', async () => {
      mockDnsLookup.mockResolvedValue({ address: '8.8.8.8', family: 4 });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'https://dns.google',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await adapter(config);

      expect(mockHttpAdapter).toHaveBeenCalled();
    });

    it('should allow requests to standard web servers', async () => {
      mockDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'https://example.com',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await adapter(config);

      expect(mockHttpAdapter).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle URLs with authentication', async () => {
      mockDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'https://user:pass@example.com/api',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await adapter(config);

      expect(mockHttpAdapter).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://user:pass@example.com/api',
        }),
      );
    });

    it('should handle URLs with fragments', async () => {
      mockDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'https://example.com/page#section',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      await adapter(config);

      expect(mockHttpAdapter).toHaveBeenCalled();
    });

    it('should work without pre-existing headers', async () => {
      mockDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'https://example.com',
        headers: undefined,
      } as unknown as InternalAxiosRequestConfig;

      await adapter(config);

      expect(mockHttpAdapter).toHaveBeenCalled();
      expect(config.httpsAgent).toBeInstanceOf(https.Agent);
    });

    it('should work with plain object headers', async () => {
      mockDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const adapter = getSecureAxiosAdapter(dependencies);
      const config = {
        url: 'https://example.com',
        headers: { 'Content-Type': 'application/json' },
      } as unknown as InternalAxiosRequestConfig;

      await adapter(config);

      expect(mockHttpAdapter).toHaveBeenCalled();
      expect(config.httpsAgent).toBeInstanceOf(https.Agent);
    });
  });
});
