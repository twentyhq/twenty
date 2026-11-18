import { deriveWebPushVapidKeyPair } from 'src/engine/core-modules/web-push/utils/derive-web-push-vapid-key-pair.util';

describe('deriveWebPushVapidKeyPair', () => {
  it('derives the same key pair from the same raw key', () => {
    expect(
      deriveWebPushVapidKeyPair({ rawKey: 'test-encryption-key' }),
    ).toEqual({
      publicKey:
        'BLdWe0WlMTd783jeef87XuglF_NkqO91teRWZGbbNCXYmiOEblr4mPJ1wnIL1-NWDmk0bc__s3r_B-H6OAQnX7M',
      privateKey: 'xKfneOVILaDn_klgtKJ9hq1G0AXyuAbp5j4W1VnsJXM',
    });
  });
});
