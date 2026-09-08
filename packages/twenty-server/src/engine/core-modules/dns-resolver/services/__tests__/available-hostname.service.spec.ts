import { Test, type TestingModule } from '@nestjs/testing';

import { DnsResolverExceptionCode } from 'src/engine/core-modules/dns-resolver/exceptions/dns-resolver.exception';
import { AvailableHostnameService } from 'src/engine/core-modules/dns-resolver/services/available-hostname.service';
import { DnsResolverService } from 'src/engine/core-modules/dns-resolver/services/dns-resolver.service';
import { type HostnameAvailability } from 'src/engine/core-modules/dns-resolver/types/hostname-availability.type';

describe('AvailableHostnameService', () => {
  let service: AvailableHostnameService;
  let checkHostnameAvailability: jest.Mock;

  const respondWith = (
    byHostname: Record<string, HostnameAvailability>,
    fallback: HostnameAvailability,
  ) => {
    checkHostnameAvailability.mockImplementation(
      async (hostname: string) => byHostname[hostname] ?? fallback,
    );
  };

  beforeEach(async () => {
    checkHostnameAvailability = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailableHostnameService,
        {
          provide: DnsResolverService,
          useValue: { checkHostnameAvailability },
        },
      ],
    }).compile();

    service = module.get(AvailableHostnameService);
  });

  it('returns the preferred hostname when nothing occupies it', async () => {
    respondWith({}, 'AVAILABLE');

    expect(
      await service.findAvailableHostnameOrThrow({
        preferredPrefix: 'lnk',
        domain: 'acme.com',
      }),
    ).toBe('lnk.acme.com');
  });

  it('falls back to a suffixed hostname when the preferred one is taken', async () => {
    respondWith({ 'lnk.acme.com': 'OCCUPIED' }, 'AVAILABLE');

    const hostname = await service.findAvailableHostnameOrThrow({
      preferredPrefix: 'lnk',
      domain: 'acme.com',
    });

    expect(hostname).not.toBe('lnk.acme.com');
    expect(hostname).toMatch(/^lnk[a-z0-9]{4}\.acme\.com$/);
  });

  it('keeps the preferred hostname when the zone answers every label', async () => {
    respondWith({}, 'OCCUPIED');

    expect(
      await service.findAvailableHostnameOrThrow({
        preferredPrefix: 'lnk',
        domain: 'wildcard.com',
      }),
    ).toBe('lnk.wildcard.com');
  });

  it('keeps the preferred hostname when resolution is inconclusive', async () => {
    respondWith({}, 'UNKNOWN');

    expect(
      await service.findAvailableHostnameOrThrow({
        preferredPrefix: 'lnk',
        domain: 'acme.com',
      }),
    ).toBe('lnk.acme.com');
  });

  it('throws once every candidate is occupied', async () => {
    checkHostnameAvailability.mockImplementation(async (hostname: string) =>
      hostname.startsWith('lnk') ? 'OCCUPIED' : 'AVAILABLE',
    );

    await expect(
      service.findAvailableHostnameOrThrow({
        preferredPrefix: 'lnk',
        domain: 'acme.com',
      }),
    ).rejects.toMatchObject({
      code: DnsResolverExceptionCode.NO_AVAILABLE_HOSTNAME,
    });
  });
});
