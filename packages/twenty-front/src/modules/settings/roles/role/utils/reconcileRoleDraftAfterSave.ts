import { reconcileRoleDraft } from '@/settings/roles/role/utils/reconcileRoleDraft';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const reconcileRoleDraftAfterSave = ({
  savedRole,
  persistedRoleBeforeSave,
  submittedDraftRole,
  currentDraftRole,
  saveFailed,
}: {
  savedRole: RoleWithPartialMembers;
  persistedRoleBeforeSave: RoleWithPartialMembers;
  submittedDraftRole: RoleWithPartialMembers;
  currentDraftRole: RoleWithPartialMembers;
  saveFailed: boolean;
}): RoleWithPartialMembers => {
  const submittedRoleAfterSave = saveFailed
    ? reconcileRoleDraft({
        savedRole,
        baselineRole: persistedRoleBeforeSave,
        draftRole: submittedDraftRole,
      })
    : savedRole;

  return reconcileRoleDraft({
    savedRole: submittedRoleAfterSave,
    baselineRole: submittedDraftRole,
    draftRole: currentDraftRole,
  });
};
