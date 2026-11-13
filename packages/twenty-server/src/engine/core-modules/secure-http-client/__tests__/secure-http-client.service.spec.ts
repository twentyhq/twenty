import { Test } from '@nestjs/testing';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const buildService = async ({
  isSafeModeEnabled,
  allowedInternalHosts,
}: {
  isSafeModeEnabled: boolean;
  allowedInternalHosts: string[];
}): Promise<SecureHttpClientService> => {
  const moduleRef = await Test.createTestingModule({
    providers: [
      SecureHttpClientService,
      {
        provide: MetricsService,
        useValue: {
          getMeter: () => ({ createCounter: () => ({ add: jest.fn() }) }),
        },
      },
      {
        provide: TwentyConfigService,
        useValue: {
          get: (key: string) =>
            key === 'OUTBOUND_HTTP_SAFE_MODE_ENABLED'
              ? isSafeModeEnabled
              : allowedInternalHosts,
        },
      },
    ],
  }).compile();

  return moduleRef.get(SecureHttpClientService);
};

describe('SecureHttpClientService', () => {
  it('keeps the SSRF-safe agents for public-only clients when safe mode is disabled', async () => {
    const service = await buildService({
      isSafeModeEnabled: false,
      allowedInternalHosts: [],
    });

    expect(service.getHttpClient().defaults.httpsAgent).toBeUndefined();

    const publicOnlyClient = service.getHttpClient({
      shouldRestrictToPublicHosts: true,
    });

    expect(publicOnlyClient.defaults.httpAgent).toBeDefined();
    expect(publicOnlyClient.defaults.httpsAgent).toBeDefined();
  });

  it('keeps the SSRF-safe agents for public-only clients when every internal host is allowed', async () => {
    const service = await buildService({
      isSafeModeEnabled: true,
      allowedInternalHosts: ['*'],
    });

    expect(service.getHttpClient().defaults.httpsAgent).toBeUndefined();
    expect(
      service.getHttpClient({ shouldRestrictToPublicHosts: true }).defaults
        .httpsAgent,
    ).toBeDefined();
  });
});
