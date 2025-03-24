import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { Role } from '~/generated/graphql';

export const settingsPersistedRoleFamilyState = createFamilyState<Role, string>(
  {
    key: 'settingsPersistedRoleFamilyState',
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
    },
  },
);
