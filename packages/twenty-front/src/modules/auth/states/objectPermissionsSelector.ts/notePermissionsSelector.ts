import { objectPermissionsFamilySelector } from '@/auth/states/objectPermissionsSelector.ts/objectPermissionsFamilySelector';
import { selector } from 'recoil';

export const notePermissionsSelector = selector<{
  canRead: boolean;
  canUpdate: boolean;
}>({
  key: 'notePermissionsSelector',
  get: ({ get }) => {
    return get(objectPermissionsFamilySelector({ objectNameSingular: 'note' }));
  },
});
