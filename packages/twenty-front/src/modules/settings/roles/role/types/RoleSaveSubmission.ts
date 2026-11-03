import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export type RoleSaveSubmission = {
  draftRole: RoleWithPartialMembers;
  persistedRole: RoleWithPartialMembers | undefined;
};
