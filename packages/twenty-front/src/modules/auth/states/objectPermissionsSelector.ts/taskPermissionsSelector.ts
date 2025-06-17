import { objectPermissionsFamilySelector } from '@/auth/states/objectPermissionsSelector.ts/objectPermissionsFamilySelector';
import { selector } from 'recoil';

export const taskPermissionsSelector = selector<{
  canRead: boolean;
  canUpdate: boolean;
}>({
  key: 'taskPermissionsSelector',
  get: ({ get }) => {
    return get(objectPermissionsFamilySelector({ objectNameSingular: 'task' }));
  },
});
