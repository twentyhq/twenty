import { RecordShareAccessLevel } from 'twenty-shared/types';

import { validateShareWithPrincipalsOrThrow } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/validate-share-with-principals-or-throw.util';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';

const WORKSPACE_MEMBER_ID = '20202020-0000-4000-8000-000000000001';
const ROLE_ID = '20202020-0000-4000-8000-000000000002';
const DELETED_WORKSPACE_MEMBER_ID = '20202020-0000-4000-8000-000000000003';
const UNKNOWN_ID = '20202020-0000-4000-8000-000000000009';

const flatWorkspaceMemberMaps = {
  byId: {
    [WORKSPACE_MEMBER_ID]: { id: WORKSPACE_MEMBER_ID },
    [DELETED_WORKSPACE_MEMBER_ID]: {
      id: DELETED_WORKSPACE_MEMBER_ID,
      deletedAt: '2026-09-01T00:00:00.000Z',
    },
  },
  idByUserId: {},
} as unknown as FlatWorkspaceMemberMaps;

const flatRoleMaps = {
  universalIdentifierById: { [ROLE_ID]: 'role-universal-identifier' },
} as unknown as FlatRoleMaps;

describe('validateShareWithPrincipalsOrThrow', () => {
  it('should accept a member, a role and everyone that belong to the workspace', () => {
    expect(() =>
      validateShareWithPrincipalsOrThrow({
        shareWith: [
          {
            workspaceMemberId: WORKSPACE_MEMBER_ID,
            accessLevel: RecordShareAccessLevel.READ,
          },
          { roleId: ROLE_ID, accessLevel: RecordShareAccessLevel.READ_WRITE },
          { everyone: true, accessLevel: RecordShareAccessLevel.READ },
        ],
        flatWorkspaceMemberMaps,
        flatRoleMaps,
      }),
    ).not.toThrow();
  });

  it('should reject a workspace member of another workspace', () => {
    expect(() =>
      validateShareWithPrincipalsOrThrow({
        shareWith: [
          {
            workspaceMemberId: UNKNOWN_ID,
            accessLevel: RecordShareAccessLevel.READ,
          },
        ],
        flatWorkspaceMemberMaps,
        flatRoleMaps,
      }),
    ).toThrow('workspace member that does not belong to this workspace');
  });

  it('should reject a soft-deleted workspace member', () => {
    expect(() =>
      validateShareWithPrincipalsOrThrow({
        shareWith: [
          {
            workspaceMemberId: DELETED_WORKSPACE_MEMBER_ID,
            accessLevel: RecordShareAccessLevel.READ,
          },
        ],
        flatWorkspaceMemberMaps,
        flatRoleMaps,
      }),
    ).toThrow('workspace member that does not belong to this workspace');
  });

  it('should reject a role of another workspace', () => {
    expect(() =>
      validateShareWithPrincipalsOrThrow({
        shareWith: [
          { roleId: UNKNOWN_ID, accessLevel: RecordShareAccessLevel.READ },
        ],
        flatWorkspaceMemberMaps,
        flatRoleMaps,
      }),
    ).toThrow('role that does not belong to this workspace');
  });
});
