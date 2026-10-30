import { isBuiltInAccountAppId } from '@/settings/app-preferences/utils/isBuiltInAccountAppId';

describe('isBuiltInAccountAppId', () => {
  it.each(['google', 'outlook', 'imap'])('accepts %s', (appId) => {
    expect(isBuiltInAccountAppId(appId)).toBe(true);
  });

  it.each(['20202020-1a2b-4c3d-8e4f-000000000021', 'accounts', undefined])(
    'rejects %s',
    (appId) => {
      expect(isBuiltInAccountAppId(appId)).toBe(false);
    },
  );
});
