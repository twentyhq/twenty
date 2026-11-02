import { SystemPermissionFlag as SharedSystemPermissionFlag } from 'twenty-shared/constants';

import { SystemPermissionFlag } from '@/sdk/define';

describe('SystemPermissionFlag', () => {
  it('should resolve the new and deprecated names to the same universal identifiers', () => {
    expect(SystemPermissionFlag.USER_APPS).toBe(
      'e5f63b2d-5369-5df6-8f32-a8bd9e79e653',
    );
    expect(SystemPermissionFlag.CONNECTED_ACCOUNTS).toBe(
      SystemPermissionFlag.USER_APPS,
    );
    expect(SystemPermissionFlag.WORKSPACE_APPS).toBe(
      '9faa55f7-2606-566b-9e1d-aefbedbd0136',
    );
    expect(SystemPermissionFlag.APPLICATIONS).toBe(
      SystemPermissionFlag.WORKSPACE_APPS,
    );
  });

  it('should enumerate exactly the shared flags, as before the new names', () => {
    expect(Object.entries(SystemPermissionFlag)).toEqual(
      Object.entries(SharedSystemPermissionFlag),
    );
  });

  it('should still exclude a flag filtered out by its deprecated name', () => {
    const allButUserApps = Object.entries(SystemPermissionFlag)
      .filter(([name]) => name !== 'CONNECTED_ACCOUNTS')
      .map(([, universalIdentifier]) => universalIdentifier);

    expect(allButUserApps).not.toContain(SystemPermissionFlag.USER_APPS);
  });

  it('should list the new names first among all own property names', () => {
    expect(
      Object.getOwnPropertyNames(SystemPermissionFlag).slice(0, 2),
    ).toEqual(['USER_APPS', 'WORKSPACE_APPS']);
  });
});
