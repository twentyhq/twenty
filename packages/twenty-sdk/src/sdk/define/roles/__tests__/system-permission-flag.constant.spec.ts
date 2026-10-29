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

  it('should keep every shared flag', () => {
    expect(SystemPermissionFlag).toEqual(
      expect.objectContaining(SharedSystemPermissionFlag),
    );
  });

  it('should list the new names before the deprecated ones', () => {
    const names = Object.keys(SystemPermissionFlag);

    expect(names.indexOf('USER_APPS')).toBeLessThan(
      names.indexOf('CONNECTED_ACCOUNTS'),
    );
    expect(names.indexOf('WORKSPACE_APPS')).toBeLessThan(
      names.indexOf('APPLICATIONS'),
    );
  });
});
