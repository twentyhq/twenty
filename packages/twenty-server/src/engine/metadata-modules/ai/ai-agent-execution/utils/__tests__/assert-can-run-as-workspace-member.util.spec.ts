import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { assertCanRunAsWorkspaceMember } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/assert-can-run-as-workspace-member.util';

const MEMBER_ID = 'workspace-member-1';
const APPLICATION = {
  id: 'application-1',
  defaultRoleId: 'application-role-1',
} as FlatApplication;

describe('assertCanRunAsWorkspaceMember', () => {
  it('should hand back the calling application for an application token', () => {
    expect(
      assertCanRunAsWorkspaceMember({
        runAsWorkspaceMemberId: MEMBER_ID,
        callerApplication: APPLICATION,
        requestUserWorkspaceId: null,
        requestWorkspaceMemberId: null,
      }),
    ).toBe(APPLICATION);
  });

  it('should let a token issued for a user run as that same member', () => {
    expect(
      assertCanRunAsWorkspaceMember({
        runAsWorkspaceMemberId: MEMBER_ID,
        callerApplication: APPLICATION,
        requestUserWorkspaceId: 'user-workspace-1',
        requestWorkspaceMemberId: MEMBER_ID,
      }),
    ).toBe(APPLICATION);
  });

  it.each([
    {
      title: 'without an application token',
      callerApplication: undefined,
      requestUserWorkspaceId: null,
      requestWorkspaceMemberId: null,
    },
    {
      title: 'for another member than the user of the token',
      callerApplication: APPLICATION,
      requestUserWorkspaceId: 'user-workspace-1',
      requestWorkspaceMemberId: 'workspace-member-2',
    },
    {
      title: 'for an application without a role',
      callerApplication: { ...APPLICATION, defaultRoleId: null },
      requestUserWorkspaceId: null,
      requestWorkspaceMemberId: null,
    },
  ])(
    'should refuse $title',
    ({
      callerApplication,
      requestUserWorkspaceId,
      requestWorkspaceMemberId,
    }) => {
      expect(() =>
        assertCanRunAsWorkspaceMember({
          runAsWorkspaceMemberId: MEMBER_ID,
          callerApplication,
          requestUserWorkspaceId,
          requestWorkspaceMemberId,
        }),
      ).toThrow(
        expect.objectContaining({
          code: AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_ALLOWED,
        }),
      );
    },
  );
});
