import { EventEmitter } from 'events';
import * as http from 'http';
import * as https from 'https';
import { type Duplex } from 'stream';

import { Logger } from '@nestjs/common';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('SecureHttpClientService', () => {
  const buildService = (config: {
    OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: string[];
    OUTBOUND_HTTP_SAFE_MODE_ENABLED?: boolean;
  }) =>
    new SecureHttpClientService({
      get: (key: keyof typeof config) => config[key],
    } as unknown as TwentyConfigService);

  describe('getSsrfSafeAgent', () => {
    it('returns an agent matching the URL protocol', () => {
      const service = buildService({
        OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: [],
      });

      expect(
        service.getSsrfSafeAgent(new URL('https://idp.example.com')),
      ).toBeInstanceOf(https.Agent);
      expect(
        service.getSsrfSafeAgent(new URL('http://idp.example.com')),
      ).toBeInstanceOf(http.Agent);
    });

    it('returns an agent that blocks a private address', () => {
      const service = buildService({
        OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: [],
      });

      const agent = service.getSsrfSafeAgent(
        new URL('http://169.254.169.254/latest/meta-data/'),
      ) as http.Agent;

      expect(() =>
        agent.createConnection(
          { host: '169.254.169.254' } as http.ClientRequestArgs,
          jest.fn(),
        ),
      ).toThrow(
        'Request to internal IP address 169.254.169.254 is not allowed.',
      );
    });

    it('returns undefined when all internal hosts are allowed', () => {
      const service = buildService({
        OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: ['*'],
      });

      expect(
        service.getSsrfSafeAgent(new URL('http://keycloak:8080')),
      ).toBeUndefined();
    });

    it('honours the deprecated OUTBOUND_HTTP_SAFE_MODE_ENABLED=false and warns once', () => {
      const warnSpy = jest
        .spyOn(Logger.prototype, 'warn')
        .mockImplementation(() => undefined);
      const service = buildService({
        OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: ['keycloak'],
        OUTBOUND_HTTP_SAFE_MODE_ENABLED: false,
      });

      expect(
        service.getSsrfSafeAgent(new URL('http://keycloak:8080')),
      ).toBeUndefined();
      expect(
        service.getSsrfSafeAgent(new URL('http://10.0.0.1')),
      ).toBeUndefined();
      expect(warnSpy).toHaveBeenCalledTimes(1);

      warnSpy.mockRestore();
    });

    it('accepts a full URL or host:port entry and matches on the hostname', () => {
      const socket = new EventEmitter();
      const createConnectionSpy = jest
        .spyOn(http.Agent.prototype, 'createConnection')
        .mockReturnValue(socket as unknown as Duplex);
      const service = buildService({
        OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: [
          'http://Keycloak:8080/realms/twenty',
          '[::1]:993',
        ],
      });

      const agent = service.getSsrfSafeAgent(
        new URL('http://keycloak:8080'),
      ) as http.Agent;

      agent.createConnection(
        { host: '::1' } as http.ClientRequestArgs,
        jest.fn(),
      );
      agent.createConnection(
        { host: 'keycloak' } as http.ClientRequestArgs,
        jest.fn(),
      );
      socket.emit('lookup', null, '172.18.0.5', 4, 'keycloak');

      expect(createConnectionSpy).toHaveBeenCalledTimes(2);

      createConnectionSpy.mockRestore();
    });
  });

  describe('getValidatedHost', () => {
    it('lets an allowed private IP through, ignoring surrounding whitespace', async () => {
      const service = buildService({
        OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: [' 192.168.1.10 '],
      });

      await expect(service.getValidatedHost('192.168.1.10')).resolves.toBe(
        '192.168.1.10',
      );
    });

    it('still blocks a private IP that is not allowed', async () => {
      const service = buildService({
        OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: ['192.168.1.10'],
      });

      await expect(service.getValidatedHost('10.0.0.1')).rejects.toThrow(
        'Connection to internal IP address 10.0.0.1 is not allowed.',
      );
    });
  });
});
