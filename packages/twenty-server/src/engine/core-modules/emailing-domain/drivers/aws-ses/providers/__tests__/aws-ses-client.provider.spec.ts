import { SESClient } from '@aws-sdk/client-ses';
import { SESv2Client } from '@aws-sdk/client-sesv2';

import { AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { type ConfigGroupHashService } from 'src/engine/core-modules/twenty-config/services/config-group-hash.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

jest.mock('@aws-sdk/client-ses', () => ({
  SESClient: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@aws-sdk/client-sesv2', () => ({
  SESv2Client: jest.fn().mockImplementation(() => ({})),
}));
jest.mock(
  'src/engine/core-modules/twenty-config/twenty-config.service',
  () => ({
    TwentyConfigService: class {},
  }),
);
jest.mock(
  'src/engine/core-modules/twenty-config/services/config-group-hash.service',
  () => ({
    ConfigGroupHashService: class {},
  }),
);

describe('AwsSesClientProvider', () => {
  const configValues: Record<string, string | undefined> = {
    AWS_SES_REGION: 'eu-central-1',
    AWS_SES_ACCESS_KEY_ID: 'test-access-key',
    AWS_SES_SECRET_ACCESS_KEY: 'test-secret-key',
    AWS_SES_SESSION_TOKEN: 'test-session-token',
  };
  const getConfig = jest.fn((key: string) => configValues[key]);
  const computeHash = jest.fn();
  let provider: AwsSesClientProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    getConfig.mockImplementation((key: string) => configValues[key]);
    computeHash.mockReturnValue('initial-config');
    provider = new AwsSesClientProvider(
      { get: getConfig } as unknown as TwentyConfigService,
      { computeHash } as unknown as ConfigGroupHashService,
    );
  });

  it('uses the same region and configured credentials for both SES APIs', () => {
    provider.getSESClient();
    provider.getSESv1Client();

    expect(SESClient).toHaveBeenCalledWith(
      expect.objectContaining({
        region: 'eu-central-1',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
          sessionToken: 'test-session-token',
        },
      }),
    );
    expect(jest.mocked(SESClient).mock.calls[0][0]).toEqual(
      jest.mocked(SESv2Client).mock.calls[0][0],
    );
  });

  it('reuses each client until the SES configuration changes', () => {
    const original = provider.getSESClient();
    const originalLegacy = provider.getSESv1Client();

    expect(provider.getSESClient()).toBe(original);
    expect(provider.getSESv1Client()).toBe(originalLegacy);

    computeHash.mockReturnValue('updated-config');

    expect(provider.getSESClient()).not.toBe(original);
    expect(provider.getSESv1Client()).not.toBe(originalLegacy);
    expect(SESClient).toHaveBeenCalledTimes(2);
    expect(SESv2Client).toHaveBeenCalledTimes(2);
  });

  it('leaves credential resolution to the SDK when explicit keys are absent', () => {
    getConfig.mockImplementation((key: string) =>
      key === 'AWS_SES_REGION' ? 'eu-central-1' : undefined,
    );

    provider.getSESv1Client();

    expect(jest.mocked(SESClient).mock.calls[0][0]).not.toHaveProperty(
      'credentials',
    );
  });
});
