import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
import { mockedRoles } from '~/testing/mock-data/generated/metadata/roles/mock-roles-data';

const role = { ...mockedRoles[1], permissionFlags: [] };
const draftFlag = {
  id: 'temporary-id',
  roleId: role.id,
  flag: 'APP_SEND_NOTIFICATION',
};
const draftRole = { ...role, permissionFlags: [draftFlag] };
const savedRole = {
  ...role,
  permissionFlags: [
    {
      ...draftFlag,
      id: 'server-id',
      __typename: 'RolePermissionFlag' as const,
    },
  ],
};

describe('getRoleDirtyFields', () => {
  it('treats saved flags as clean despite generated IDs and GraphQL metadata', () => {
    expect(getRoleDirtyFields(draftRole, savedRole)).toEqual({});
  });

  it('ignores flag ordering without modifying either role', () => {
    const otherFlag = { ...draftFlag, id: 'other-id', flag: 'APP_CONFIGURE' };
    const draft = { ...role, permissionFlags: [draftFlag, otherFlag] };
    const persisted = { ...role, permissionFlags: [otherFlag, draftFlag] };

    expect(getRoleDirtyFields(draft, persisted)).toEqual({});
    expect(draft.permissionFlags).toEqual([draftFlag, otherFlag]);
    expect(persisted.permissionFlags).toEqual([otherFlag, draftFlag]);
  });

  it('keeps additions made during a save dirty until they are undone', () => {
    const otherFlag = { ...draftFlag, id: 'other-id', flag: 'APP_CONFIGURE' };
    const draft = { ...draftRole, permissionFlags: [draftFlag, otherFlag] };

    expect(getRoleDirtyFields(draft, savedRole)).toEqual({
      permissionFlags: draft.permissionFlags,
    });
    expect(getRoleDirtyFields(draftRole, savedRole)).toEqual({});
  });

  it('detects flag removals and replacements', () => {
    expect(getRoleDirtyFields(role, savedRole)).toEqual({
      permissionFlags: [],
    });
    const replacement = { ...draftFlag, flag: 'APP_CONFIGURE' };
    expect(
      getRoleDirtyFields(
        { ...role, permissionFlags: [replacement] },
        savedRole,
      ),
    ).toEqual({ permissionFlags: [replacement] });
  });

  it('keeps failed flag changes and unrelated edits dirty', () => {
    expect(getRoleDirtyFields(draftRole, role)).toEqual({
      permissionFlags: [draftFlag],
    });
    expect(
      getRoleDirtyFields({ ...draftRole, label: 'Unsaved label' }, savedRole),
    ).toEqual({ label: 'Unsaved label' });
  });

  it('retains new-role fields when there is no persisted role', () => {
    expect(getRoleDirtyFields(draftRole, undefined)).toEqual(draftRole);
  });
});
