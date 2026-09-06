import { canApplicationTokenRunAsWorkspaceMember } from 'src/engine/core-modules/auth/utils/can-application-token-run-as-workspace-member.util';

const WORKSPACE_MEMBER_ID = '20202020-0000-0000-0000-000000000001';
const OTHER_WORKSPACE_MEMBER_ID = '20202020-0000-0000-0000-000000000002';

describe('canApplicationTokenRunAsWorkspaceMember', () => {
  it('should allow an application-only token to act as any member', () => {
    expect(
      canApplicationTokenRunAsWorkspaceMember({
        isDelegatedToUser: false,
        requestWorkspaceMemberId: null,
        workspaceMemberId: WORKSPACE_MEMBER_ID,
      }),
    ).toBe(true);
  });

  it('should allow a delegated token to act as the member it was issued for', () => {
    expect(
      canApplicationTokenRunAsWorkspaceMember({
        isDelegatedToUser: true,
        requestWorkspaceMemberId: WORKSPACE_MEMBER_ID,
        workspaceMemberId: WORKSPACE_MEMBER_ID,
      }),
    ).toBe(true);
  });

  it('should refuse a delegated token acting as another member', () => {
    expect(
      canApplicationTokenRunAsWorkspaceMember({
        isDelegatedToUser: true,
        requestWorkspaceMemberId: OTHER_WORKSPACE_MEMBER_ID,
        workspaceMemberId: WORKSPACE_MEMBER_ID,
      }),
    ).toBe(false);
  });

  it('should refuse a delegated token whose member is unresolved', () => {
    expect(
      canApplicationTokenRunAsWorkspaceMember({
        isDelegatedToUser: true,
        requestWorkspaceMemberId: null,
        workspaceMemberId: WORKSPACE_MEMBER_ID,
      }),
    ).toBe(false);
  });
});
