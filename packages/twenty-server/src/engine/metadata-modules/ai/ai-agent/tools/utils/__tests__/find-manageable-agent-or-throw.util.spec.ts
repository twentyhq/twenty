import { WorkflowActionType } from 'twenty-shared/workflow';

import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { findManageableAgentOrThrow } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/find-manageable-agent-or-throw.util';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const workspaceId = 'workspace-id';
const agentId = '20202020-0000-4000-8000-000000000001';
const workspaceCustomApplicationId = 'workspace-custom-application-id';
const installedApplicationId = 'installed-application-id';

const context: ToolProviderContext = {
  workspaceId,
  rolePermissionConfig: {
    intersectionOf: { userWorkspaceRoleId: 'caller-role-id' },
  },
};

const findManageableAgent = ({
  agent,
  workflowSteps = [],
  toolContext = context,
}: {
  agent: { applicationId: string; isSystem: boolean };
  workflowSteps?: unknown[];
  toolContext?: ToolProviderContext;
}) =>
  findManageableAgentOrThrow({
    agentId,
    context: toolContext,
    agentService: {
      findOneAgentById: jest.fn().mockResolvedValue({ id: agentId, ...agent }),
    } as unknown as AgentService,
    applicationService: {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
        .fn()
        .mockResolvedValue({
          workspaceCustomFlatApplication: { id: workspaceCustomApplicationId },
        }),
    } as unknown as ApplicationService,
    workspaceCacheService: {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatWorkflowVersionMaps: {
          byUniversalIdentifier: {
            'workflow-version-id': { steps: workflowSteps },
            'empty-workflow-version-id': { steps: null },
          },
        },
      }),
    } as unknown as WorkspaceCacheService,
  });

describe('findManageableAgentOrThrow', () => {
  it('returns an agent of the workspace custom application, even flagged as system', async () => {
    await expect(
      findManageableAgent({
        agent: { applicationId: workspaceCustomApplicationId, isSystem: true },
      }),
    ).resolves.toMatchObject({ id: agentId });
  });

  it('refuses an agent defined by an installed application, even when not flagged as system', async () => {
    await expect(
      findManageableAgent({
        agent: { applicationId: installedApplicationId, isSystem: false },
      }),
    ).rejects.toMatchObject({
      code: AiExceptionCode.INVALID_AGENT_INPUT,
      message: expect.stringContaining('installed application'),
    });
  });

  it('refuses an agent backing a workflow AI step', async () => {
    await expect(
      findManageableAgent({
        agent: { applicationId: workspaceCustomApplicationId, isSystem: false },
        workflowSteps: [
          {
            type: WorkflowActionType.AI_AGENT,
            settings: { input: { agentId } },
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: AiExceptionCode.INVALID_AGENT_INPUT,
      message: expect.stringContaining('update_workflow_agent'),
    });
  });

  it('reports an agent out of the calling application reach as not found', async () => {
    await expect(
      findManageableAgent({
        agent: { applicationId: workspaceCustomApplicationId, isSystem: false },
        toolContext: {
          ...context,
          application: {
            id: installedApplicationId,
            sourceType: 'npm',
          } as unknown as FlatApplication,
        },
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.AGENT_NOT_FOUND });
  });
});
