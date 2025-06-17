import { objectPermissionsFamilySelector } from '@/auth/states/objectPermissionsSelector.ts/objectPermissionsFamilySelector';
import { selector } from 'recoil';

export const opportunityPermissionsSelector = selector<{
  canRead: boolean;
  canUpdate: boolean;
}>({
  key: 'opportunityPermissionsSelector',
  get: ({ get }) => {
    return get(
      objectPermissionsFamilySelector({ objectNameSingular: 'opportunity' }),
    );
  },
});
