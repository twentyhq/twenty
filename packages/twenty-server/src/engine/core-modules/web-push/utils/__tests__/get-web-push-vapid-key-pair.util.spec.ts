import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { getWebPushVapidKeyPair } from 'src/engine/core-modules/web-push/utils/get-web-push-vapid-key-pair.util';

const buildConfig = (
  env: Record<string, string>,
): Pick<TwentyConfigService, 'get'> => ({
  get: jest.fn((key: string) => env[key]) as never,
});

const TEST_KEY_PAIR = {
  publicKey:
    'BLdWe0WlMTd783jeef87XuglF_NkqO91teRWZGbbNCXYmiOEblr4mPJ1wnIL1-NWDmk0bc__s3r_B-H6OAQnX7M',
  privateKey: 'xKfneOVILaDn_klgtKJ9hq1G0AXyuAbp5j4W1VnsJXM',
};

describe('getWebPushVapidKeyPair', () => {
  it('should derive a stable key pair from ENCRYPTION_KEY', () => {
    expect(
      getWebPushVapidKeyPair({
        twentyConfigService: buildConfig({
          ENCRYPTION_KEY: 'test-encryption-key',
          APP_SECRET: 'app-secret',
        }),
      }),
    ).toEqual(TEST_KEY_PAIR);
  });

  it('should fall back to APP_SECRET on legacy instances', () => {
    expect(
      getWebPushVapidKeyPair({
        twentyConfigService: buildConfig({ APP_SECRET: 'test-encryption-key' }),
      }),
    ).toEqual(TEST_KEY_PAIR);
  });
});
