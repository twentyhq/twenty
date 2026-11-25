import { PermissionFlagType } from 'twenty-shared/constants';

import { hasNativePagePermission } from '@/navigation-menu-item/display/native-page/utils/hasNativePagePermission';

describe('hasNativePagePermission', () => {
  it('allows a native page when the member has its permission', () => {
    expect(
      hasNativePagePermission({
        item: { nativePageKey: 'agents' },
        permissionFlagMap: { [PermissionFlagType.AI]: true },
      }),
    ).toBe(true);
  });

  it('refuses a native page when the member lacks its permission', () => {
    expect(
      hasNativePagePermission({
        item: { nativePageKey: 'agents' },
        permissionFlagMap: { [PermissionFlagType.WORKFLOWS]: true },
      }),
    ).toBe(false);
  });
});
