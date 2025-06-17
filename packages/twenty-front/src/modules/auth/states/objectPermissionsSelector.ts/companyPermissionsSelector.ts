import { objectPermissionsFamilySelector } from '@/auth/states/objectPermissionsSelector.ts/objectPermissionsFamilySelector';
import { selector } from 'recoil';

export const companyPermissionsSelector = selector<{
  canRead: boolean;
  canUpdate: boolean;
}>({
  key: 'companyPermissionsSelector',
  get: ({ get }) => {
    return get(
      objectPermissionsFamilySelector({ objectNameSingular: 'company' }),
    );
  },
});
