import { SystemPermissionFlag as SharedSystemPermissionFlag } from 'twenty-shared/constants';

import { SystemPermissionFlag } from '@/sdk/define';

describe('SystemPermissionFlag', () => {
  it('should list every shared universal identifier exactly once', () => {
    expect(Object.values(SystemPermissionFlag).sort()).toEqual(
      Object.values(SharedSystemPermissionFlag).sort(),
    );
  });

  it('should list the new names instead of the deprecated ones', () => {
    expect(Object.keys(SystemPermissionFlag)).toEqual(
      expect.arrayContaining(['USER_APPS', 'WORKSPACE_APPS']),
    );
    expect(Object.keys(SystemPermissionFlag)).not.toEqual(
      expect.arrayContaining(['CONNECTED_ACCOUNTS']),
    );
    expect(Object.keys(SystemPermissionFlag)).not.toEqual(
      expect.arrayContaining(['APPLICATIONS']),
    );
  });

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
});
