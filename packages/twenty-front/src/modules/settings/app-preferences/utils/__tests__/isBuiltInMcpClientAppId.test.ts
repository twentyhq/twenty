import { isBuiltInMcpClientAppId } from '@/settings/app-preferences/utils/isBuiltInMcpClientAppId';

describe('isBuiltInMcpClientAppId', () => {
  it.each(['chatgpt', 'claude'])('accepts %s', (applicationId) => {
    expect(isBuiltInMcpClientAppId(applicationId)).toBe(true);
  });

  it.each(['google', '20202020-1a2b-4c3d-8e4f-000000000021', undefined])(
    'rejects %s',
    (applicationId) => {
      expect(isBuiltInMcpClientAppId(applicationId)).toBe(false);
    },
  );
});
