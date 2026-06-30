import { EventEmitter } from 'events';
import * as http from 'http';
import * as https from 'https';
import { type Socket } from 'net';

import { createSsrfSafeAgent } from 'src/engine/core-modules/secure-http-client/utils/create-ssrf-safe-agent.util';

const createMockSocket = (): Socket & { destroy: jest.Mock } => {
  const emitter = new EventEmitter();

  return Object.assign(emitter, {
    destroy: jest.fn(),
    // Minimal Socket stubs to avoid type errors
    connecting: false,
    writable: true,
  }) as unknown as Socket & { destroy: jest.Mock };
};

describe('createSsrfSafeAgent', () => {
  let mockSocket: ReturnType<typeof createMockSocket>;
  let createConnectionSpy: jest.SpyInstance;

  beforeEach(() => {
    mockSocket = createMockSocket();

    createConnectionSpy = jest
      .spyOn(http.Agent.prototype, 'createConnection')
      .mockReturnValue(mockSocket as any);

    jest
      .spyOn(https.Agent.prototype, 'createConnection')
      .mockReturnValue(mockSocket as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('agent creation', () => {
    it('should return an http.Agent for http protocol', () => {
      const agent = createSsrfSafeAgent('http');

      expect(agent).toBeInstanceOf(http.Agent);
    });

    it('should return an https.Agent for https protocol', () => {
      const agent = createSsrfSafeAgent('https');

      expect(agent).toBeInstanceOf(https.Agent);
    });
  });

  describe('IP literal blocking in createConnection', () => {
    it('should throw for loopback IP 127.0.0.1', () => {
      const agent = createSsrfSafeAgent('http');

      expect(() => {
        agent.createConnection({ host: '127.0.0.1' } as any, jest.fn() as any);
      }).toThrow('Request to internal IP address 127.0.0.1 is not allowed.');
    });

    it('should throw for private IP 10.0.0.1', () => {
      const agent = createSsrfSafeAgent('http');

      expect(() => {
        agent.createConnection({ host: '10.0.0.1' } as any, jest.fn() as any);
      }).toThrow('Request to internal IP address 10.0.0.1 is not allowed.');
    });

    it('should throw for private IP 192.168.1.1', () => {
      const agent = createSsrfSafeAgent('http');

      expect(() => {
        agent.createConnection(
          { host: '192.168.1.1' } as any,
          jest.fn() as any,
        );
      }).toThrow('Request to internal IP address 192.168.1.1 is not allowed.');
    });

    it('should throw for private IP 172.16.0.1', () => {
      const agent = createSsrfSafeAgent('http');

      expect(() => {
        agent.createConnection({ host: '172.16.0.1' } as any, jest.fn() as any);
      }).toThrow('Request to internal IP address 172.16.0.1 is not allowed.');
    });

    it('should throw for link-local IP 169.254.169.254', () => {
      const agent = createSsrfSafeAgent('http');

      expect(() => {
        agent.createConnection(
          { host: '169.254.169.254' } as any,
          jest.fn() as any,
        );
      }).toThrow(
        'Request to internal IP address 169.254.169.254 is not allowed.',
      );
    });

    it('should allow public IP 93.184.216.34', () => {
      const agent = createSsrfSafeAgent('http');

      agent.createConnection(
        { host: '93.184.216.34' } as any,
        jest.fn() as any,
      );

      expect(createConnectionSpy).toHaveBeenCalled();
    });

    it('should allow hostnames (validated later via DNS lookup)', () => {
      const agent = createSsrfSafeAgent('http');

      agent.createConnection({ host: 'example.com' } as any, jest.fn() as any);

      expect(createConnectionSpy).toHaveBeenCalled();
    });
  });

  describe('DNS lookup validation via socket event', () => {
    it('should destroy socket when DNS resolves to loopback IP', () => {
      const agent = createSsrfSafeAgent('http');

      agent.createConnection({ host: 'evil.com' } as any, jest.fn() as any);

      mockSocket.emit('lookup', null, '127.0.0.1', 4, 'evil.com');

      expect(mockSocket.destroy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('127.0.0.1'),
        }),
      );
    });

    it('should destroy socket when DNS resolves to 10.x.x.x', () => {
      const agent = createSsrfSafeAgent('http');

      agent.createConnection({ host: 'evil.com' } as any, jest.fn() as any);

      mockSocket.emit('lookup', null, '10.0.0.1', 4, 'evil.com');

      expect(mockSocket.destroy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('10.0.0.1'),
        }),
      );
    });

    it('should destroy socket when DNS resolves to 192.168.x.x', () => {
      const agent = createSsrfSafeAgent('http');

      agent.createConnection({ host: 'evil.com' } as any, jest.fn() as any);

      mockSocket.emit('lookup', null, '192.168.1.1', 4, 'evil.com');

      expect(mockSocket.destroy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('192.168.1.1'),
        }),
      );
    });

    it('should destroy socket when DNS resolves to cloud metadata IP', () => {
      const agent = createSsrfSafeAgent('http');

      agent.createConnection(
        { host: 'metadata.internal' } as any,
        jest.fn() as any,
      );

      mockSocket.emit(
        'lookup',
        null,
        '169.254.169.254',
        4,
        'metadata.internal',
      );

      expect(mockSocket.destroy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('169.254.169.254'),
        }),
      );
    });

    it('should not destroy socket when DNS resolves to public IP', () => {
      const agent = createSsrfSafeAgent('http');

      agent.createConnection({ host: 'example.com' } as any, jest.fn() as any);

      mockSocket.emit('lookup', null, '93.184.216.34', 4, 'example.com');

      expect(mockSocket.destroy).not.toHaveBeenCalled();
    });

    it('should not destroy socket on DNS lookup error', () => {
      const agent = createSsrfSafeAgent('http');

      agent.createConnection(
        { host: 'nonexistent.example' } as any,
        jest.fn() as any,
      );

      mockSocket.emit(
        'lookup',
        new Error('ENOTFOUND'),
        '',
        4,
        'nonexistent.example',
      );

      expect(mockSocket.destroy).not.toHaveBeenCalled();
    });
  });

  describe('HTTPS agent', () => {
    it('should block private IPs for HTTPS connections', () => {
      const agent = createSsrfSafeAgent('https');

      expect(() => {
        agent.createConnection({ host: '127.0.0.1' } as any, jest.fn() as any);
      }).toThrow('Request to internal IP address 127.0.0.1 is not allowed.');
    });

    it('should validate DNS lookups for HTTPS connections', () => {
      const agent = createSsrfSafeAgent('https');

      agent.createConnection({ host: 'evil.com' } as any, jest.fn() as any);

      mockSocket.emit('lookup', null, '10.0.0.1', 4, 'evil.com');

      expect(mockSocket.destroy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('10.0.0.1'),
        }),
      );
    });
  });

  describe('IPv6 handling', () => {
    it('should block IPv6 loopback ::1 as IP literal', () => {
      const agent = createSsrfSafeAgent('http');

      expect(() => {
        agent.createConnection({ host: '::1' } as any, jest.fn() as any);
      }).toThrow('Request to internal IP address ::1 is not allowed.');
    });

    it('should destroy socket when DNS resolves to IPv6 private address', () => {
      const agent = createSsrfSafeAgent('http');

      agent.createConnection({ host: 'evil.com' } as any, jest.fn() as any);

      mockSocket.emit('lookup', null, 'fe80::1', 6, 'evil.com');

      expect(mockSocket.destroy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('fe80::1'),
        }),
      );
    });

    it('should allow public IPv6 addresses', () => {
      const agent = createSsrfSafeAgent('http');

      agent.createConnection({ host: 'example.com' } as any, jest.fn() as any);

      mockSocket.emit('lookup', null, '2001:4860:4860::8888', 6, 'example.com');

      expect(mockSocket.destroy).not.toHaveBeenCalled();
    });
  });
});
