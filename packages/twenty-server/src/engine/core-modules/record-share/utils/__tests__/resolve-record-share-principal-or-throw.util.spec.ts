/* @license Enterprise */

import { RecordSharePrincipalType } from 'twenty-shared/types';

import { RecordShareException } from 'src/engine/core-modules/record-share/record-share.exception';
import { resolveRecordSharePrincipalOrThrow } from 'src/engine/core-modules/record-share/utils/resolve-record-share-principal-or-throw.util';

const WORKSPACE_MEMBER_ID = '20202020-0000-4000-8000-000000000001';
const ROLE_ID = '20202020-0000-4000-8000-000000000002';

describe('resolveRecordSharePrincipalOrThrow', () => {
  it('should resolve a workspace member', () => {
    expect(
      resolveRecordSharePrincipalOrThrow({
        workspaceMemberId: WORKSPACE_MEMBER_ID,
      }),
    ).toEqual({
      principalId: WORKSPACE_MEMBER_ID,
      principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
    });
  });

  it('should resolve a role', () => {
    expect(resolveRecordSharePrincipalOrThrow({ roleId: ROLE_ID })).toEqual({
      principalId: ROLE_ID,
      principalType: RecordSharePrincipalType.ROLE,
    });
  });

  it.each([
    [{}],
    [{ workspaceMemberId: null, roleId: null }],
    [{ workspaceMemberId: WORKSPACE_MEMBER_ID, roleId: ROLE_ID }],
    [{ workspaceMemberId: 'not-a-uuid' }],
    [{ roleId: 'not-a-uuid' }],
  ])('should reject %j', (principal) => {
    expect(() => resolveRecordSharePrincipalOrThrow(principal)).toThrow(
      RecordShareException,
    );
  });
});
