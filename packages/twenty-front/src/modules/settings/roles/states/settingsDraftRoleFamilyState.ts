import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { Role } from '~/generated/graphql';

export const settingsDraftRoleFamilyState = createFamilyState<Role, string>({
  key: 'settingsDraftRoleFamilyState',
  defaultValue: {
    id: '',
    label: '',
    description: '',
    icon: '',
    canDestroyAllObjectRecords: false,
    canReadAllObjectRecords: false,
    canSoftDeleteAllObjectRecords: false,
    canUpdateAllObjectRecords: false,
    canUpdateAllSettings: false,
    isEditable: false,
    workspaceMembers: [],
    settingPermissions: [],
    objectPermissions: [],
  },
});
