import { SystemPermissionFlag as SharedSystemPermissionFlag } from 'twenty-shared/constants';

import { SystemPermissionFlag } from '@/sdk/define';

describe('SystemPermissionFlag', () => {
  it('should expose every shared permission flag', () => {
    expect(SystemPermissionFlag).toMatchObject(SharedSystemPermissionFlag);
  });

  it('should keep the deprecated names on the universal identifiers published apps reference', () => {
    expect(SystemPermissionFlag.CONNECTED_ACCOUNTS).toBe(
      'e5f63b2d-5369-5df6-8f32-a8bd9e79e653',
    );
    expect(SystemPermissionFlag.USER_APPS).toBe(
      SystemPermissionFlag.CONNECTED_ACCOUNTS,
    );
    expect(SystemPermissionFlag.APPLICATIONS).toBe(
      '9faa55f7-2606-566b-9e1d-aefbedbd0136',
    );
    expect(SystemPermissionFlag.WORKSPACE_APPS).toBe(
      SystemPermissionFlag.APPLICATIONS,
    );
  });
});
