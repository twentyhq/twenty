import { objectPermissionsFamilySelector } from '@/auth/states/objectPermissionsSelector.ts/objectPermissionsFamilySelector';
import { selector } from 'recoil';

export const personPermissionsSelector = selector<{
  canRead: boolean;
  canUpdate: boolean;
}>({
  key: 'personPermissionsSelector',
  get: ({ get }) => {
    return get(
      objectPermissionsFamilySelector({ objectNameSingular: 'person' }),
    );
  },
});
