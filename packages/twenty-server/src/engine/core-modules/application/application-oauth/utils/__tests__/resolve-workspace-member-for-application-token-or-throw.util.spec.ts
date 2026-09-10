import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';
import { resolveWorkspaceMemberForApplicationTokenOrThrow } from 'src/engine/core-modules/application/application-oauth/utils/resolve-workspace-member-for-application-token-or-throw.util';

const WORKSPACE_MEMBER_ID = 'member-id';
const OTHER_WORKSPACE_MEMBER_ID = 'other-member-id';

type TestWorkspaceMember = {
  id: string;
  userId: string;
  deletedAt: string | null;
};

const buildMember = (
  overrides: Partial<TestWorkspaceMember> = {},
): TestWorkspaceMember => ({
  id: WORKSPACE_MEMBER_ID,
  userId: 'user-id',
  deletedAt: null,
  ...overrides,
});

const resolve = ({
  member = buildMember(),
  workspaceMemberId = WORKSPACE_MEMBER_ID,
  applicationDefaultRoleId = 'application-role-id',
  requestUserWorkspaceId = null,
  requestWorkspaceMemberId = null,
}: {
  member?: TestWorkspaceMember | undefined;
  workspaceMemberId?: string;
  applicationDefaultRoleId?: string | null;
  requestUserWorkspaceId?: string | null;
  requestWorkspaceMemberId?: string | null;
} = {}) =>
  resolveWorkspaceMemberForApplicationTokenOrThrow({
    workspaceMemberId,
    applicationDefaultRoleId,
    requestUserWorkspaceId,
    requestWorkspaceMemberId,
    flatWorkspaceMemberMaps: {
      byId: member ? { [member.id]: member } : {},
    },
  });

describe('resolveWorkspaceMemberForApplicationTokenOrThrow', () => {
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

  it('should refuse an application that has no role of its own', () => {
    expect(() => resolve({ applicationDefaultRoleId: null })).toThrow(
      expect.objectContaining({ code: ApplicationExceptionCode.FORBIDDEN }),
    );
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
