/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';

import { RecordShareExceptionCode } from 'src/engine/core-modules/record-share/record-share.exception';
import { resolveRecordShareEntriesOrThrow } from 'src/engine/core-modules/record-share/utils/resolve-record-share-entries-or-throw.util';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';

const WORKSPACE_MEMBER_ID = '20202020-0000-4000-8000-000000000001';
const ROLE_ID = '20202020-0000-4000-8000-000000000002';
const UNKNOWN_ID = '20202020-0000-4000-8000-000000000009';

const flatWorkspaceMemberMaps = {
  byId: { [WORKSPACE_MEMBER_ID]: { id: WORKSPACE_MEMBER_ID } },
  idByUserId: {},
} as unknown as FlatWorkspaceMemberMaps;

const flatRoleMaps = {
  universalIdentifierById: { [ROLE_ID]: 'role-universal-identifier' },
} as unknown as FlatRoleMaps;

const resolve = (
  shareWith: Parameters<
    typeof resolveRecordShareEntriesOrThrow
  >[0]['shareWith'],
) =>
  resolveRecordShareEntriesOrThrow({
    shareWith,
    flatWorkspaceMemberMaps,
    flatRoleMaps,
  });

describe('resolveRecordShareEntriesOrThrow', () => {
  it('resolves a member, a role and everyone', () => {
    expect(
      resolve([
        {
          workspaceMemberId: WORKSPACE_MEMBER_ID,
          accessLevel: RecordShareAccessLevel.READ,
        },
        { roleId: ROLE_ID, accessLevel: RecordShareAccessLevel.FULL },
        { everyone: true, accessLevel: RecordShareAccessLevel.READ_WRITE },
      ]),
    ).toEqual([
      {
        principalId: WORKSPACE_MEMBER_ID,
        principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        accessLevel: RecordShareAccessLevel.READ,
      },
      {
        principalId: ROLE_ID,
        principalType: RecordSharePrincipalType.ROLE,
        accessLevel: RecordShareAccessLevel.FULL,
      },
      {
        principalId: EVERYONE_PRINCIPAL_ID,
        principalType: RecordSharePrincipalType.EVERYONE,
        accessLevel: RecordShareAccessLevel.READ_WRITE,
      },
    ]);
  });

  it('keeps NONE on a named principal as the removal of its grant', () => {
    expect(
      resolve([
        {
          workspaceMemberId: WORKSPACE_MEMBER_ID,
          accessLevel: RecordShareAccessLevel.NONE,
        },
        { roleId: ROLE_ID, accessLevel: RecordShareAccessLevel.NONE },
      ]),
    ).toEqual([
      {
        principalId: WORKSPACE_MEMBER_ID,
        principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        accessLevel: RecordShareAccessLevel.NONE,
      },
      {
        principalId: ROLE_ID,
        principalType: RecordSharePrincipalType.ROLE,
        accessLevel: RecordShareAccessLevel.NONE,
      },
    ]);
  });

  it('removes the grant of a principal that no longer exists', () => {
    expect(
      resolve([
        { roleId: UNKNOWN_ID, accessLevel: RecordShareAccessLevel.NONE },
      ]),
    ).toEqual([
      {
        principalId: UNKNOWN_ID,
        principalType: RecordSharePrincipalType.ROLE,
        accessLevel: RecordShareAccessLevel.NONE,
      },
    ]);
  });

  it('sets the general access of everyone to NONE', () => {
    expect(
      resolve([{ everyone: true, accessLevel: RecordShareAccessLevel.NONE }]),
    ).toEqual([
      {
        principalId: EVERYONE_PRINCIPAL_ID,
        principalType: RecordSharePrincipalType.EVERYONE,
        accessLevel: RecordShareAccessLevel.NONE,
      },
    ]);
  });

  it.each([
    [
      'a role that is not in the workspace',
      [{ roleId: UNKNOWN_ID, accessLevel: RecordShareAccessLevel.READ }],
    ],
    [
      'a member that is not in the workspace',
      [
        {
          workspaceMemberId: UNKNOWN_ID,
          accessLevel: RecordShareAccessLevel.READ,
        },
      ],
    ],
    [
      'everyone with full access',
      [{ everyone: true, accessLevel: RecordShareAccessLevel.FULL }],
    ],
    [
      'a removal naming two principals',
      [
        {
          workspaceMemberId: WORKSPACE_MEMBER_ID,
          roleId: ROLE_ID,
          accessLevel: RecordShareAccessLevel.NONE,
        },
      ],
    ],
    [
      'a removal naming no principal',
      [{ accessLevel: RecordShareAccessLevel.NONE }],
    ],
    [
      'the same principal twice',
      [
        { roleId: ROLE_ID, accessLevel: RecordShareAccessLevel.READ },
        { roleId: ROLE_ID, accessLevel: RecordShareAccessLevel.NONE },
      ],
    ],
  ])('rejects %s', (_description, shareWith) => {
    expect(() => resolve(shareWith)).toThrow(
      expect.objectContaining({
        code: RecordShareExceptionCode.INVALID_SHARE_WITH,
      }),
    );
  });
});
