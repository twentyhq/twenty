import { PermissionFlagType } from 'twenty-shared/constants';
import { FieldActorSource } from 'twenty-shared/types';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { AgentToolProvider } from 'src/engine/core-modules/tool-provider/providers/agent-tool.provider';
import { type AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { AgentToolWorkspaceService } from 'src/engine/metadata-modules/ai/ai-agent/tools/services/agent-tool.workspace-service';
import { type AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

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

const buildProvider = (options?: {
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
    isFeatureEnabled: jest
      .fn()
      .mockResolvedValue(options?.isAiChatInboxEnabled ?? true),
  };

  const provider = new AgentToolProvider(
    new AgentToolWorkspaceService(
      agentService as unknown as AgentService,
      aiModelRegistryService as unknown as AiModelRegistryService,
    ),
    permissionsService as unknown as PermissionsService,
    featureFlagService as unknown as FeatureFlagService,
  );

  return {
    provider,
    agentService,
    aiModelRegistryService,
    permissionsService,
  };
};

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

describe('AgentToolProvider', () => {
  describe('isAvailable', () => {
    it('is available when the caller has the AI settings permission', async () => {
      const { provider, permissionsService } = buildProvider();

      await expect(provider.isAvailable(context)).resolves.toBe(true);
      expect(permissionsService.checkRolesPermissions).toHaveBeenCalledTimes(1);
      expect(permissionsService.checkRolesPermissions).toHaveBeenCalledWith(
        context.rolePermissionConfig,
        workspaceId,
        PermissionFlagType.AI_SETTINGS,
      );
    });

    it('is not available without the AI settings permission', async () => {
      const { provider } = buildProvider({ hasAiSettingsPermission: false });

      await expect(provider.isAvailable(context)).resolves.toBe(false);
    });

    it('is not available while the AI chat inbox feature flag is off', async () => {
      const { provider, permissionsService } = buildProvider({
        isAiChatInboxEnabled: false,
      });

      await expect(provider.isAvailable(context)).resolves.toBe(false);
      expect(permissionsService.checkRolesPermissions).not.toHaveBeenCalled();
    });
  });

  it('exposes the agent management tools', async () => {
    const { provider } = buildProvider();

    const descriptors = await provider.generateDescriptors(context, {
      includeSchemas: true,
    });

    expect(descriptors.map((descriptor) => descriptor.name)).toEqual([
      'list_agents',
      'create_agent',
      'update_agent',
      'delete_agent',
    ]);
  });

  describe('list_agents', () => {
    it('leaves out system agents', async () => {
      const { provider, agentService } = buildProvider();

      agentService.findManyAgents.mockResolvedValue([
        buildAgent(),
        buildAgent({ id: 'workflow-step-agent-id', isSystem: true }),
      ]);

      const output = await provider.executeStaticTool(
        'list_agents',
        {},
        context,
      );

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
      const { provider, agentService } = buildProvider();

      agentService.findManyAgents.mockResolvedValue([
        buildAgent(),
        buildAgent({
          id: 'other-application-agent-id',
          applicationId: otherApplication.id,
        }),
      ]);

      const output = await provider.executeStaticTool(
        'list_agents',
        {},
        applicationContext,
      );

      expect(output.result).toMatchObject({
        count: 1,
        agents: [{ id: 'other-application-agent-id' }],
      });
    });

    it('refuses to update or delete an agent of another application', async () => {
      const { provider, agentService } = buildProvider();

      await expect(
        provider.executeStaticTool(
          'update_agent',
          { id: agentId, prompt: 'Something else' },
          applicationContext,
        ),
      ).rejects.toMatchObject({ code: AiExceptionCode.AGENT_NOT_FOUND });
      await expect(
        provider.executeStaticTool(
          'delete_agent',
          { id: agentId },
          applicationContext,
        ),
      ).rejects.toMatchObject({ code: AiExceptionCode.AGENT_NOT_FOUND });
      expect(agentService.updateOneAgent).not.toHaveBeenCalled();
      expect(agentService.deleteOneAgent).not.toHaveBeenCalled();
    });
  });

  describe('create_agent', () => {
    it('creates an agent on the workspace default model with generated trigger ids', async () => {
      const { provider, agentService, aiModelRegistryService } =
        buildProvider();

      const output = await provider.executeStaticTool(
        'create_agent',
        {
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
        context,
      );

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
      const { provider, agentService, aiModelRegistryService } =
        buildProvider();

      const output = await provider.executeStaticTool(
        'update_agent',
        {
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
        context,
      );

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
      const { provider, agentService } = buildProvider();

      agentService.findOneAgentById.mockResolvedValue(
        buildAgent({ isSystem: true }),
      );

      await expect(
        provider.executeStaticTool(
          'update_agent',
          { id: agentId, prompt: 'Something else' },
          context,
        ),
      ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
      expect(agentService.updateOneAgent).not.toHaveBeenCalled();
    });
  });

  describe('delete_agent', () => {
    it('deletes the agent', async () => {
      const { provider, agentService } = buildProvider();

      const output = await provider.executeStaticTool(
        'delete_agent',
        { id: agentId },
        context,
      );

      expect(output.success).toBe(true);
      expect(agentService.deleteOneAgent).toHaveBeenCalledTimes(1);
      expect(agentService.deleteOneAgent).toHaveBeenCalledWith(
        agentId,
        workspaceId,
      );
    });

    it('refuses to delete an agent backing a workflow step', async () => {
      const { provider, agentService } = buildProvider();

      agentService.findOneAgentById.mockResolvedValue(
        buildAgent({ isSystem: true }),
      );

      await expect(
        provider.executeStaticTool('delete_agent', { id: agentId }, context),
      ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
      expect(agentService.deleteOneAgent).not.toHaveBeenCalled();
    });
  });
});
