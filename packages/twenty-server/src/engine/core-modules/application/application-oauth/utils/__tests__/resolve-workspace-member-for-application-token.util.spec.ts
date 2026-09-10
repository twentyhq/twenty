import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';
import { resolveWorkspaceMemberForApplicationToken } from 'src/engine/core-modules/application/application-oauth/utils/resolve-workspace-member-for-application-token.util';
import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';

const WORKSPACE_MEMBER_ID = 'member-id';
const OTHER_WORKSPACE_MEMBER_ID = 'other-member-id';

const buildMember = (
  overrides: Partial<FlatWorkspaceMember> = {},
): FlatWorkspaceMember =>
  ({
    id: WORKSPACE_MEMBER_ID,
    userId: 'user-id',
    deletedAt: null,
    ...overrides,
  }) as FlatWorkspaceMember;

const resolve = ({
  member = buildMember(),
  workspaceMemberId = WORKSPACE_MEMBER_ID,
  requestUserWorkspaceId = null,
  requestWorkspaceMemberId = null,
}: {
  member?: FlatWorkspaceMember | undefined;
  workspaceMemberId?: string;
  requestUserWorkspaceId?: string | null;
  requestWorkspaceMemberId?: string | null;
} = {}) =>
  resolveWorkspaceMemberForApplicationToken({
    workspaceMemberId,
    requestUserWorkspaceId,
    requestWorkspaceMemberId,
    flatWorkspaceMemberMaps: {
      byId: member ? { [member.id]: member } : {},
    },
  });

describe('resolveWorkspaceMemberForApplicationToken', () => {
  it('should return the member for a token not bound to a person', () => {
    expect(resolve()).toMatchObject({ id: WORKSPACE_MEMBER_ID });
  });

  it('should let a token issued for a person re-issue itself for that person', () => {
    expect(
      resolve({
        requestUserWorkspaceId: 'user-workspace-id',
        requestWorkspaceMemberId: WORKSPACE_MEMBER_ID,
      }),
    ).toMatchObject({ id: WORKSPACE_MEMBER_ID });
  });

  it('should refuse a token issued for a person asking for another member', () => {
    expect(() =>
      resolve({
        requestUserWorkspaceId: 'user-workspace-id',
        requestWorkspaceMemberId: OTHER_WORKSPACE_MEMBER_ID,
      }),
    ).toThrow(
      expect.objectContaining({ code: ApplicationExceptionCode.FORBIDDEN }),
    );
  });

  it('should refuse an unknown member', () => {
    expect(() => resolve({ workspaceMemberId: 'unknown-member-id' })).toThrow(
      expect.objectContaining({
        code: ApplicationExceptionCode.WORKSPACE_MEMBER_NOT_FOUND,
      }),
    );
  });

  it('should refuse a deleted member', () => {
    expect(() =>
      resolve({
        member: buildMember({ deletedAt: new Date().toISOString() }),
      }),
    ).toThrow(
      expect.objectContaining({
        code: ApplicationExceptionCode.WORKSPACE_MEMBER_NOT_FOUND,
      }),
    );
  });
});
