import { objectPermissionsFamilySelector } from '@/auth/states/objectPermissionsSelector.ts/objectPermissionsFamilySelector';
import { selector } from 'recoil';

export const workflowPermissionsSelector = selector<{
  canRead: boolean;
  canUpdate: boolean;
}>({
  key: 'workflowPermissionsSelector',
  get: ({ get }) => {
    return get(
      objectPermissionsFamilySelector({ objectNameSingular: 'workflow' }),
    );
  },
});
