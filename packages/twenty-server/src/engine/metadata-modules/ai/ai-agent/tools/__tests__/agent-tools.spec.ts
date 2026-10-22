import { type DiscoveryService } from '@nestjs/core';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey, FieldActorSource } from 'twenty-shared/types';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { DefinedToolRegistryService } from 'src/engine/core-modules/tool-provider/services/defined-tool-registry.service';
import { type AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { CreateAgentTool } from 'src/engine/metadata-modules/ai/ai-agent/tools/create-agent.tool';
import { DeleteAgentTool } from 'src/engine/metadata-modules/ai/ai-agent/tools/delete-agent.tool';
import { ListAgentsTool } from 'src/engine/metadata-modules/ai/ai-agent/tools/list-agents.tool';
import { UpdateAgentTool } from 'src/engine/metadata-modules/ai/ai-agent/tools/update-agent.tool';
import { type AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

const workspaceId = 'workspace-id';
const agentId = '20202020-0000-4000-8000-000000000001';
const roleId = '20202020-0000-4000-8000-000000000002';
const existingTriggerId = '20202020-0000-4000-8000-000000000003';

const buildAgent = (overrides: Record<string, unknown> = {}) => ({
  id: agentId,
  name: 'dealWatcher',
  label: 'Deal watcher',
  description: null,
  icon: null,
  prompt: 'Watch deals',
  modelId: 'workspace-default-model',
  roleId,
  triggers: [],
  applicationId: 'application-id',
  isCustom: true,
  isSystem: false,
  ...overrides,
});

const otherApplication = {
  id: 'other-application-id',
  sourceType: 'npm',
} as unknown as FlatApplication;

const context: ToolProviderContext = {
  workspaceId,
  rolePermissionConfig: {
    intersectionOf: { userWorkspaceRoleId: 'caller-role-id' },
  },
  userWorkspaceId: 'caller-user-workspace-id',
  actorContext: {
    source: FieldActorSource.MANUAL,
    workspaceMemberId: 'caller-workspace-member-id',
    name: 'Caller',
    context: {},
  },
};

// Runs the tools through the registry, which applies their declared gates and parses their input
const buildAgentTools = (options?: {
  hasAiSettingsPermission?: boolean;
  isAiChatInboxEnabled?: boolean;
}) => {
  const agentService = {
    findManyAgents: jest.fn().mockResolvedValue([]),
    findOneAgentById: jest.fn().mockResolvedValue(buildAgent()),
    createOneAgent: jest
      .fn()
      .mockImplementation(async (input) => buildAgent(input)),
    updateOneAgent: jest
      .fn()
      .mockImplementation(async ({ input }) => buildAgent(input)),
    deleteOneAgent: jest.fn().mockResolvedValue(buildAgent()),
  };
  const aiModelRegistryService = {
    validateModelAvailability: jest.fn(),
  };
  const permissionsService = {
    checkRolesPermissions: jest
      .fn()
      .mockResolvedValue(options?.hasAiSettingsPermission ?? true),
  };
  const featureFlagService = {
    getWorkspaceFeatureFlagsMap: jest.fn().mockResolvedValue({
      [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED]:
        options?.isAiChatInboxEnabled ?? true,
    }),
  };

  const tools = [
    new ListAgentsTool(agentService as unknown as AgentService),
    new CreateAgentTool(
      agentService as unknown as AgentService,
      aiModelRegistryService as unknown as AiModelRegistryService,
    ),
    new UpdateAgentTool(
      agentService as unknown as AgentService,
      aiModelRegistryService as unknown as AiModelRegistryService,
    ),
    new DeleteAgentTool(agentService as unknown as AgentService),
  ];

  const definedToolRegistryService = new DefinedToolRegistryService(
    {
      getProviders: () =>
        tools.map((tool) => ({ instance: tool, metatype: tool.constructor })),
    } as unknown as DiscoveryService,
    permissionsService as unknown as PermissionsService,
    featureFlagService as unknown as FeatureFlagService,
  );

  definedToolRegistryService.onModuleInit();

  const listToolNames = async () =>
    (
      await definedToolRegistryService.getAvailableDescriptors(context, {
        includeSchemas: false,
      })
    ).map((descriptor) => descriptor.name);

  const executeTool = ({
    toolName,
    args,
    toolContext = context,
  }: {
    toolName: string;
    args: Record<string, unknown>;
    toolContext?: ToolProviderContext;
  }) => {
    const definedTool = definedToolRegistryService.findDefinedTool(toolName);

    jestExpectToBeDefined(definedTool);

    return definedToolRegistryService.execute({
      definedTool,
      args,
      context: toolContext,
    });
  };

  return {
    listToolNames,
    executeTool,
    agentService,
    aiModelRegistryService,
    permissionsService,
  };
};

describe('Agent tools', () => {
  describe('availability', () => {
    it('is available when the caller has the AI settings permission', async () => {
      const { listToolNames, permissionsService } = buildAgentTools();

      await expect(listToolNames()).resolves.toHaveLength(4);
      expect(permissionsService.checkRolesPermissions).toHaveBeenCalledTimes(1);
      expect(permissionsService.checkRolesPermissions).toHaveBeenCalledWith(
        context.rolePermissionConfig,
        workspaceId,
        PermissionFlagType.AI_SETTINGS,
      );
    });

    it('is not available without the AI settings permission', async () => {
      const { listToolNames, executeTool, agentService } = buildAgentTools({
        hasAiSettingsPermission: false,
      });

      await expect(listToolNames()).resolves.toEqual([]);
      await expect(
        executeTool({ toolName: 'list_agents', args: {} }),
      ).resolves.toMatchObject({
        success: false,
        message: 'Tool "list_agents" is not available',
      });
      expect(agentService.findManyAgents).not.toHaveBeenCalled();
    });

    it('is not available while the AI chat inbox feature flag is off', async () => {
      const { listToolNames, executeTool, agentService, permissionsService } =
        buildAgentTools({ isAiChatInboxEnabled: false });

      await expect(listToolNames()).resolves.toEqual([]);
      await expect(
        executeTool({ toolName: 'list_agents', args: {} }),
      ).resolves.toMatchObject({
        success: false,
        message: 'Tool "list_agents" is not available',
      });
      expect(permissionsService.checkRolesPermissions).not.toHaveBeenCalled();
      expect(agentService.findManyAgents).not.toHaveBeenCalled();
    });
  });

  it('exposes the agent management tools', async () => {
    const { listToolNames } = buildAgentTools();

    await expect(listToolNames()).resolves.toEqual([
      'list_agents',
      'create_agent',
      'update_agent',
      'delete_agent',
    ]);
  });

  describe('list_agents', () => {
    it('leaves out system agents', async () => {
      const { executeTool, agentService } = buildAgentTools();

      agentService.findManyAgents.mockResolvedValue([
        buildAgent(),
        buildAgent({ id: 'workflow-step-agent-id', isSystem: true }),
      ]);

      const output = await executeTool({ toolName: 'list_agents', args: {} });

      expect(output.success).toBe(true);
      expect(output.result).toMatchObject({
        count: 1,
        agents: [{ id: agentId }],
      });
    });
  });

  describe('application scope', () => {
    const applicationContext: ToolProviderContext = {
      ...context,
      application: otherApplication,
    };

    it('only lists the agents of the calling application', async () => {
      const { executeTool, agentService } = buildAgentTools();

      agentService.findManyAgents.mockResolvedValue([
        buildAgent(),
        buildAgent({
          id: 'other-application-agent-id',
          applicationId: otherApplication.id,
        }),
      ]);

      const output = await executeTool({
        toolName: 'list_agents',
        args: {},
        toolContext: applicationContext,
      });

      expect(output.result).toMatchObject({
        count: 1,
        agents: [{ id: 'other-application-agent-id' }],
      });
    });

    it('refuses to update or delete an agent of another application', async () => {
      const { executeTool, agentService } = buildAgentTools();

      await expect(
        executeTool({
          toolName: 'update_agent',
          args: { id: agentId, prompt: 'Something else' },
          toolContext: applicationContext,
        }),
      ).rejects.toMatchObject({ code: AiExceptionCode.AGENT_NOT_FOUND });
      await expect(
        executeTool({
          toolName: 'delete_agent',
          args: { id: agentId },
          toolContext: applicationContext,
        }),
      ).rejects.toMatchObject({ code: AiExceptionCode.AGENT_NOT_FOUND });
      expect(agentService.updateOneAgent).not.toHaveBeenCalled();
      expect(agentService.deleteOneAgent).not.toHaveBeenCalled();
    });
  });

  describe('create_agent', () => {
    it('creates an agent on the workspace default model with generated trigger ids', async () => {
      const { executeTool, agentService, aiModelRegistryService } =
        buildAgentTools();

      const output = await executeTool({
        toolName: 'create_agent',
        args: {
          label: 'Deal watcher',
          prompt: 'Watch deals',
          roleId,
          triggers: [
            {
              type: 'DATABASE_EVENT',
              instructions: 'Post a note on the new deal',
              settings: { eventName: 'opportunity.created' },
            },
            { type: 'CRON', settings: { pattern: '0 9 * * 1' } },
          ],
        },
      });

      expect(output.success).toBe(true);
      expect(
        aiModelRegistryService.validateModelAvailability,
      ).toHaveBeenCalledTimes(1);
      expect(
        aiModelRegistryService.validateModelAvailability,
      ).toHaveBeenCalledWith('workspace-default-model');
      expect(agentService.createOneAgent).toHaveBeenCalledTimes(1);

      const [createAgentInput, calledWorkspaceId] =
        agentService.createOneAgent.mock.calls[0];

      expect(calledWorkspaceId).toBe(workspaceId);
      expect(createAgentInput).toMatchObject({
        label: 'Deal watcher',
        prompt: 'Watch deals',
        roleId,
        modelId: 'workspace-default-model',
        triggers: [
          {
            type: 'DATABASE_EVENT',
            isActive: true,
            instructions: 'Post a note on the new deal',
            settings: { eventName: 'opportunity.created' },
          },
          {
            type: 'CRON',
            isActive: true,
            instructions: null,
            settings: { pattern: '0 9 * * 1' },
          },
        ],
      });
      expect(createAgentInput.triggers[0].id).toEqual(expect.any(String));
      expect(createAgentInput.triggers[0].id).not.toBe(
        createAgentInput.triggers[1].id,
      );
    });
  });

  describe('update_agent', () => {
    it('keeps the ids of the triggers passed back and only sends the given fields', async () => {
      const { executeTool, agentService, aiModelRegistryService } =
        buildAgentTools();

      const output = await executeTool({
        toolName: 'update_agent',
        args: {
          id: agentId,
          triggers: [
            {
              id: existingTriggerId,
              type: 'CRON',
              isActive: false,
              settings: { pattern: '0 9 * * 1' },
            },
          ],
        },
      });

      expect(output.success).toBe(true);
      expect(
        aiModelRegistryService.validateModelAvailability,
      ).not.toHaveBeenCalled();
      expect(agentService.updateOneAgent).toHaveBeenCalledTimes(1);
      expect(agentService.updateOneAgent).toHaveBeenCalledWith({
        input: {
          id: agentId,
          triggers: [
            {
              id: existingTriggerId,
              type: 'CRON',
              isActive: false,
              instructions: null,
              settings: { pattern: '0 9 * * 1' },
            },
          ],
        },
        workspaceId,
      });
    });

    it('refuses to change an agent backing a workflow step', async () => {
      const { executeTool, agentService } = buildAgentTools();

      agentService.findOneAgentById.mockResolvedValue(
        buildAgent({ isSystem: true }),
      );

      await expect(
        executeTool({
          toolName: 'update_agent',
          args: { id: agentId, prompt: 'Something else' },
        }),
      ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
      expect(agentService.updateOneAgent).not.toHaveBeenCalled();
    });
  });

  describe('delete_agent', () => {
    it('deletes the agent', async () => {
      const { executeTool, agentService } = buildAgentTools();

      const output = await executeTool({
        toolName: 'delete_agent',
        args: { id: agentId },
      });

      expect(output.success).toBe(true);
      expect(agentService.deleteOneAgent).toHaveBeenCalledTimes(1);
      expect(agentService.deleteOneAgent).toHaveBeenCalledWith(
        agentId,
        workspaceId,
      );
    });

    it('refuses to delete an agent backing a workflow step', async () => {
      const { executeTool, agentService } = buildAgentTools();

      agentService.findOneAgentById.mockResolvedValue(
        buildAgent({ isSystem: true }),
      );

      await expect(
        executeTool({ toolName: 'delete_agent', args: { id: agentId } }),
      ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
      expect(agentService.deleteOneAgent).not.toHaveBeenCalled();
    });
  });
});
