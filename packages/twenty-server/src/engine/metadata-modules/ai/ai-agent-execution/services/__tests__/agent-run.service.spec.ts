import { type AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { type AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE = { id: 'workspace-1' } as never;
const APPLICATION = { id: 'application-1' } as never;
const AGENT = {
  id: 'agent-1',
  applicationId: 'application-1',
  workspaceId: 'workspace-1',
} as never;

const buildService = ({
  role,
}: {
  role?: { id: string; label: string; canBeAssignedToAgents: boolean };
} = {}) => {
  const executeAgent = jest
    .fn()
    .mockResolvedValue({
      result: { ok: true },
      hasNoMoreAvailableCredits: false,
    });

  const buildRunAsWorkspaceMemberContext = jest.fn().mockResolvedValue({
    actorContext: {},
    authContext: { type: 'user', userWorkspaceId: 'user-workspace-1' },
    roleId: 'member-role-id',
  });

  const agentRepository = { findOne: jest.fn().mockResolvedValue(AGENT) };
  const roleRepository = {
    findOne: jest.fn().mockResolvedValue(role ?? null),
  };
  const applicationService = {
    findById: jest.fn().mockResolvedValue(APPLICATION),
  };

  const service = new AgentRunService(
    {
      buildRunAsWorkspaceMemberContext,
    } as unknown as AgentActorContextService,
    { executeAgent } as unknown as AgentAsyncExecutorService,
    applicationService as never,
    agentRepository as never,
    roleRepository as never,
  );

  return { service, executeAgent, roleRepository };
};

const runWith = (
  service: AgentRunService,
  overrides: {
    callerApplication?: unknown;
    runAsRoleId?: string;
    runAsWorkspaceMemberId?: string;
    requestUserWorkspaceId?: string | null;
    requestWorkspaceMemberId?: string | null;
  },
) =>
  service.run({
    workspace: WORKSPACE,
    requestUserWorkspaceId: overrides.requestUserWorkspaceId ?? null,
    requestWorkspaceMemberId: overrides.requestWorkspaceMemberId ?? null,
    callerApplication:
      'callerApplication' in overrides
        ? (overrides.callerApplication as never)
        : APPLICATION,
    input: {
      agentUniversalIdentifier: 'agent-uid',
      prompt: 'hello',
      runAsRoleId: overrides.runAsRoleId,
      runAsWorkspaceMemberId: overrides.runAsWorkspaceMemberId,
    },
  });

describe('AgentRunService run-as authorization', () => {
  const assignableRole = {
    id: 'channel-role-id',
    label: 'Read-only CRM',
    canBeAssignedToAgents: true,
  };

  it('refuses runAsRoleId without an application token', async () => {
    const { service } = buildService({ role: assignableRole });

    await expect(
      runWith(service, {
        callerApplication: undefined,
        runAsRoleId: 'channel-role-id',
      }),
    ).rejects.toMatchObject({
      code: AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_ALLOWED,
    });
  });

  it('refuses a role that cannot be assigned to agents', async () => {
    const { service } = buildService({
      role: { ...assignableRole, canBeAssignedToAgents: false },
    });

    await expect(
      runWith(service, { runAsRoleId: 'channel-role-id' }),
    ).rejects.toMatchObject({
      code: AiExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS,
    });
  });

  it('refuses an unknown role', async () => {
    const { service } = buildService({ role: undefined });

    await expect(
      runWith(service, { runAsRoleId: 'missing-role-id' }),
    ).rejects.toMatchObject({ code: AiExceptionCode.ROLE_NOT_FOUND });
  });

  it('caps a role-only run at that role alone', async () => {
    const { service, executeAgent } = buildService({ role: assignableRole });

    await runWith(service, { runAsRoleId: 'channel-role-id' });

    expect(executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({ runAsRoleIds: ['channel-role-id'] }),
    );
  });

  it('intersects the member and channel roles when both are given', async () => {
    const { service, executeAgent } = buildService({ role: assignableRole });

    await runWith(service, {
      runAsWorkspaceMemberId: 'member-1',
      runAsRoleId: 'channel-role-id',
    });

    expect(executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        runAsRoleIds: ['member-role-id', 'channel-role-id'],
      }),
    );
  });
});
