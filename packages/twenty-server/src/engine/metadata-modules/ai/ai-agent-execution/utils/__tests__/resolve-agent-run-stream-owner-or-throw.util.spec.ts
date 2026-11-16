import { resolveAgentRunStreamOwnerOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-agent-run-stream-owner-or-throw.util';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const APPLICATION = { id: '20202020-1c25-4d02-bf25-6aeccf7ea419' };
const MEMBER_ID = '20202020-0687-4c41-b707-ed1bfca972a7';

describe('resolveAgentRunStreamOwnerOrThrow', () => {
  it('should make the calling application the owner, with the member its token is bound to', () => {
    expect(
      resolveAgentRunStreamOwnerOrThrow({
        callerApplication: APPLICATION,
        callerWorkspaceMemberId: MEMBER_ID,
      }),
    ).toEqual({
      kind: 'application',
      applicationId: APPLICATION.id,
      workspaceMemberId: MEMBER_ID,
    });
  });

  it('should make an application-only token the owner without a member', () => {
    expect(
      resolveAgentRunStreamOwnerOrThrow({
        callerApplication: APPLICATION,
        callerWorkspaceMemberId: null,
      }),
    ).toEqual({
      kind: 'application',
      applicationId: APPLICATION.id,
      workspaceMemberId: null,
    });
  });

  it('should make the member the owner of a run started from their own session', () => {
    expect(
      resolveAgentRunStreamOwnerOrThrow({
        callerApplication: undefined,
        callerWorkspaceMemberId: MEMBER_ID,
      }),
    ).toEqual({ kind: 'workspaceMember', workspaceMemberId: MEMBER_ID });
  });

  it('should refuse a caller with neither, such as an API key', () => {
    expect(() =>
      resolveAgentRunStreamOwnerOrThrow({
        callerApplication: undefined,
        callerWorkspaceMemberId: null,
      }),
    ).toThrow(
      expect.objectContaining({ code: AiExceptionCode.INVALID_AGENT_INPUT }),
    );
  });
});
