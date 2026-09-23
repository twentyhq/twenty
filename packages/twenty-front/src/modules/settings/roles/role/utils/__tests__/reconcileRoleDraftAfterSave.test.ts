import { reconcileRoleDraftAfterSave } from '@/settings/roles/role/utils/reconcileRoleDraftAfterSave';
import { mockedRoles } from '~/testing/mock-data/generated/metadata/roles/mock-roles-data';
import { getDirtyFields } from '~/utils/getDirtyFields';

const persistedRole = {
  ...mockedRoles[1],
  id: 'role-id',
  label: 'Test role',
  permissionFlags: [],
};
const submittedFlag = {
  id: 'temporary-id',
  roleId: persistedRole.id,
  flag: 'APP_SEND_NOTIFICATION',
};
const submittedDraftRole = {
  ...persistedRole,
  permissionFlags: [submittedFlag],
};
const savedRole = {
  ...persistedRole,
  permissionFlags: [
    {
      ...submittedFlag,
      id: 'server-id',
      __typename: 'RolePermissionFlag' as const,
    },
  ],
};
const saveResult = {
  savedRole,
  persistedRoleBeforeSave: persistedRole,
  submittedDraftRole,
  currentDraftRole: submittedDraftRole,
  saveFailed: false,
};

describe('reconcileRoleDraftAfterSave', () => {
  it('clears unsaved changes after saving flags with server-generated IDs', () => {
    expect(
      getDirtyFields(reconcileRoleDraftAfterSave(saveResult), savedRole),
    ).toEqual({});
  });

  it('preserves scalar edits made while the save is pending', () => {
    const draft = reconcileRoleDraftAfterSave({
      ...saveResult,
      currentDraftRole: { ...submittedDraftRole, label: 'Edited during save' },
    });
    expect(draft.permissionFlags).toEqual(savedRole.permissionFlags);
    expect(getDirtyFields(draft, savedRole)).toEqual({
      label: 'Edited during save',
    });
  });

  it('keeps canonical IDs when adding a flag during save and undoing it', () => {
    const addedFlag = { ...submittedFlag, id: 'new-id', flag: 'APP_NEW_FLAG' };
    const draft = reconcileRoleDraftAfterSave({
      ...saveResult,
      currentDraftRole: {
        ...submittedDraftRole,
        permissionFlags: [submittedFlag, addedFlag],
      },
    });
    expect(draft.permissionFlags).toEqual([
      ...savedRole.permissionFlags,
      addedFlag,
    ]);
    expect(
      getDirtyFields(
        {
          ...draft,
          permissionFlags: draft.permissionFlags?.filter(
            (permission) => permission.flag !== addedFlag.flag,
          ),
        },
        savedRole,
      ),
    ).toEqual({});
  });

  it('preserves removal of a flag during save', () => {
    const draft = reconcileRoleDraftAfterSave({
      ...saveResult,
      currentDraftRole: { ...submittedDraftRole, permissionFlags: [] },
    });
    expect(getDirtyFields(draft, savedRole)).toEqual({ permissionFlags: [] });
  });

  it('keeps failed changes while incorporating successful writes after a partial save', () => {
    const submittedRole = { ...submittedDraftRole, label: 'Updated role' };
    const draft = reconcileRoleDraftAfterSave({
      ...saveResult,
      submittedDraftRole: submittedRole,
      currentDraftRole: submittedRole,
      saveFailed: true,
    });
    expect(draft.permissionFlags).toEqual(savedRole.permissionFlags);
    expect(getDirtyFields(draft, savedRole)).toEqual({ label: 'Updated role' });
  });

  it('preserves concurrent reversals after a partial save fails', () => {
    const draft = reconcileRoleDraftAfterSave({
      ...saveResult,
      submittedDraftRole: { ...submittedDraftRole, label: 'Updated role' },
      currentDraftRole: persistedRole,
      saveFailed: true,
    });
    expect(getDirtyFields(draft, savedRole)).toEqual({ permissionFlags: [] });
  });

  it('retains the entire draft when no writes succeeded', () => {
    const draft = reconcileRoleDraftAfterSave({
      ...saveResult,
      savedRole: persistedRole,
      saveFailed: true,
    });
    expect(draft).toEqual(submittedDraftRole);
    expect(getDirtyFields(draft, persistedRole)).toEqual({
      permissionFlags: [submittedFlag],
    });
  });
});
