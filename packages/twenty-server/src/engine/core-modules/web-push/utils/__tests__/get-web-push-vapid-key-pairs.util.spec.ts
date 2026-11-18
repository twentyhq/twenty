import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { deriveWebPushVapidKeyPair } from 'src/engine/core-modules/web-push/utils/derive-web-push-vapid-key-pair.util';
import { getWebPushVapidKeyPairs } from 'src/engine/core-modules/web-push/utils/get-web-push-vapid-key-pairs.util';

type EnvMap = Partial<{
  WEB_PUSH_VAPID_PUBLIC_KEY: string;
  WEB_PUSH_VAPID_PRIVATE_KEY: string;
  ENCRYPTION_KEY: string;
  FALLBACK_ENCRYPTION_KEY: string;
  APP_SECRET: string;
}>;

const buildConfig = (env: EnvMap): Pick<TwentyConfigService, 'get'> => ({
  get: jest.fn((key: keyof EnvMap) => env[key]) as never,
});

describe('getWebPushVapidKeyPairs', () => {
  it('should only use the configured key pair when both keys are set', () => {
    expect(
      getWebPushVapidKeyPairs({
        twentyConfigService: buildConfig({
          WEB_PUSH_VAPID_PUBLIC_KEY: 'public',
          WEB_PUSH_VAPID_PRIVATE_KEY: 'private',
          ENCRYPTION_KEY: 'new-key',
        }),
      }),
    ).toEqual([{ publicKey: 'public', privateKey: 'private' }]);
  });

  it('should derive from ENCRYPTION_KEY first, then the rotation and legacy keys', () => {
    expect(
      getWebPushVapidKeyPairs({
        twentyConfigService: buildConfig({
          ENCRYPTION_KEY: 'new-key',
          FALLBACK_ENCRYPTION_KEY: 'old-key',
          APP_SECRET: 'app-secret',
        }),
      }),
    ).toEqual([
      deriveWebPushVapidKeyPair({ rawKey: 'new-key' }),
      deriveWebPushVapidKeyPair({ rawKey: 'old-key' }),
      deriveWebPushVapidKeyPair({ rawKey: 'app-secret' }),
    ]);
  });

  it('should derive from APP_SECRET alone on legacy instances', () => {
    expect(
      getWebPushVapidKeyPairs({
        twentyConfigService: buildConfig({ APP_SECRET: 'app-secret' }),
      }),
    ).toEqual([deriveWebPushVapidKeyPair({ rawKey: 'app-secret' })]);
  });
});
