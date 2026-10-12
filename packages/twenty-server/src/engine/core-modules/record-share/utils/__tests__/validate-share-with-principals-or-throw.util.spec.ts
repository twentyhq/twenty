/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';

import { validateShareWithPrincipalsOrThrow } from 'src/engine/core-modules/record-share/utils/validate-share-with-principals-or-throw.util';
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

  it('should resolve the principal and level of each entry', () => {
    expect(
      validateShareWithPrincipalsOrThrow({
        shareWith: [
          { roleId: ROLE_ID, accessLevel: RecordShareAccessLevel.FULL },
          { everyone: true, accessLevel: RecordShareAccessLevel.NONE },
        ],
        flatWorkspaceMemberMaps,
        flatRoleMaps,
      }),
    ).toEqual([
      {
        principalId: ROLE_ID,
        principalType: RecordSharePrincipalType.ROLE,
        accessLevel: RecordShareAccessLevel.FULL,
      },
      {
        principalId: EVERYONE_PRINCIPAL_ID,
        principalType: RecordSharePrincipalType.EVERYONE,
        accessLevel: RecordShareAccessLevel.NONE,
      },
    ]);
  });

  it.each([
    [{ everyone: true, accessLevel: RecordShareAccessLevel.FULL }],
    [{ roleId: ROLE_ID, accessLevel: RecordShareAccessLevel.NONE }],
    [
      {
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        accessLevel: RecordShareAccessLevel.NONE,
      },
    ],
  ])('should reject %j, which is no general access or grant', (entry) => {
    expect(() =>
      validateShareWithPrincipalsOrThrow({
        shareWith: [entry],
        flatWorkspaceMemberMaps,
        flatRoleMaps,
      }),
    ).toThrow('access level');
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
