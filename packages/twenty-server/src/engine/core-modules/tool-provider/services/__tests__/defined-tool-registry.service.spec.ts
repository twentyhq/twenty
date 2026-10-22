import { type DiscoveryService } from '@nestjs/core';

import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { z } from 'zod';

import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { DefinedToolRegistryService } from 'src/engine/core-modules/tool-provider/services/defined-tool-registry.service';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

const webhookId = '2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e';

const context: ToolProviderContext = {
  workspaceId: 'workspace-id',
  rolePermissionConfig: {
    intersectionOf: { userWorkspaceRoleId: 'member-role-id' },
  },
};

const renameWebhookInputSchema = z.object({ id: z.uuid() });

@DefineTool({
  name: 'rename_webhook',
  category: ToolCategory.WEBHOOK,
  description: 'Rename a webhook.',
  requiredPermissionFlags: [PermissionFlagType.API_KEYS_AND_WEBHOOKS],
})
class RenameWebhookTool extends BaseTool<typeof renameWebhookInputSchema> {
  readonly inputSchema = renameWebhookInputSchema;

  async execute({
    input,
  }: ToolExecuteArgs<typeof renameWebhookInputSchema>): Promise<ToolOutput> {
    return { success: true, message: `Webhook ${input.id} renamed` };
  }
}

const archiveWebhookInputSchema = z.object({ id: z.uuid() });

@DefineTool({
  name: 'archive_webhook',
  category: ToolCategory.WEBHOOK,
  description: 'Archive a webhook.',
  requiredPermissionFlags: [PermissionFlagType.API_KEYS_AND_WEBHOOKS],
  icon: 'IconWebhook',
})
class ArchiveWebhookTool extends BaseTool<typeof archiveWebhookInputSchema> {
  readonly inputSchema = archiveWebhookInputSchema;

  async execute({
    input,
  }: ToolExecuteArgs<typeof archiveWebhookInputSchema>): Promise<ToolOutput> {
    return { success: true, message: `Webhook ${input.id} archived` };
  }
}

const replayWebhookInputSchema = z.object({ id: z.uuid() });

@DefineTool({
  name: 'replay_webhook',
  category: ToolCategory.WEBHOOK,
  description: 'Replay a webhook delivery.',
  requiredPermissionFlags: [PermissionFlagType.API_KEYS_AND_WEBHOOKS],
  requiredFeatureFlags: [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED],
})
class ReplayWebhookTool extends BaseTool<typeof replayWebhookInputSchema> {
  readonly inputSchema = replayWebhookInputSchema;

  async execute({
    input,
  }: ToolExecuteArgs<typeof replayWebhookInputSchema>): Promise<ToolOutput> {
    return { success: true, message: `Webhook ${input.id} replayed` };
  }
}

const pauseWebhookInputSchema = z.object({ id: z.uuid() });

@DefineTool({
  name: 'pause_webhook',
  category: ToolCategory.WEBHOOK,
  description: 'Pause a webhook.',
  requiredPermissionFlags: [PermissionFlagType.API_KEYS_AND_WEBHOOKS],
  requiredFeatureFlags: [FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED],
})
class PauseWebhookTool extends BaseTool<typeof pauseWebhookInputSchema> {
  readonly inputSchema = pauseWebhookInputSchema;

  async execute({
    input,
  }: ToolExecuteArgs<typeof pauseWebhookInputSchema>): Promise<ToolOutput> {
    return { success: true, message: `Webhook ${input.id} paused` };
  }
}

const buildDefinedToolRegistryService = ({
  tools,
  isGranted,
  enabledFeatureFlags = [],
}: {
  tools: BaseTool[];
  isGranted: boolean;
  enabledFeatureFlags?: FeatureFlagKey[];
}) => {
  const featureFlagService = {
    getWorkspaceFeatureFlagsMap: jest
      .fn()
      .mockResolvedValue(
        Object.fromEntries(
          enabledFeatureFlags.map((featureFlag) => [featureFlag, true]),
        ),
      ),
  };

  const definedToolRegistryService = new DefinedToolRegistryService(
    {
      getProviders: () =>
        tools.map((tool) => ({ instance: tool, metatype: tool.constructor })),
    } as unknown as DiscoveryService,
    {
      checkRolesPermissions: jest.fn().mockResolvedValue(isGranted),
    } as unknown as PermissionsService,
    featureFlagService as unknown as FeatureFlagService,
  );

  definedToolRegistryService.onModuleInit();

  return { definedToolRegistryService, featureFlagService };
};

const listToolNames = async (
  definedToolRegistryService: DefinedToolRegistryService,
) =>
  (
    await definedToolRegistryService.getAvailableDescriptors(context, {
      includeSchemas: false,
    })
  ).map(({ name }) => name);

const buildRenameWebhookTool = ({ isGranted }: { isGranted: boolean }) => {
  const tool = new RenameWebhookTool();
  const { definedToolRegistryService } = buildDefinedToolRegistryService({
    tools: [tool],
    isGranted,
  });

  const definedTool =
    definedToolRegistryService.findDefinedTool('rename_webhook');

  jestExpectToBeDefined(definedTool);

  return { definedToolRegistryService, definedTool, tool };
};

describe('DefinedToolRegistryService', () => {
  describe('getAvailableDescriptors', () => {
    it('should list a declared icon and leave it out for tools without one', async () => {
      const { definedToolRegistryService } = buildDefinedToolRegistryService({
        tools: [new RenameWebhookTool(), new ArchiveWebhookTool()],
        isGranted: true,
      });

      const descriptors =
        await definedToolRegistryService.getAvailableDescriptors(context, {
          includeSchemas: false,
        });

      expect(descriptors).toStrictEqual([
        {
          name: 'rename_webhook',
          label: 'Rename Webhook',
          description: 'Rename a webhook.',
          category: ToolCategory.WEBHOOK,
          executionRef: { kind: 'static', toolId: 'rename_webhook' },
        },
        {
          name: 'archive_webhook',
          label: 'Archive Webhook',
          description: 'Archive a webhook.',
          category: ToolCategory.WEBHOOK,
          executionRef: { kind: 'static', toolId: 'archive_webhook' },
          icon: 'IconWebhook',
        },
      ]);
    });
  });

  describe('getAvailableDescriptors with feature flags', () => {
    it('should hide a tool until its feature flags are enabled for the workspace', async () => {
      const tools = [new RenameWebhookTool(), new ReplayWebhookTool()];

      expect(
        await listToolNames(
          buildDefinedToolRegistryService({ tools, isGranted: true })
            .definedToolRegistryService,
        ),
      ).toEqual(['rename_webhook']);
      expect(
        await listToolNames(
          buildDefinedToolRegistryService({
            tools,
            isGranted: true,
            enabledFeatureFlags: [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED],
          }).definedToolRegistryService,
        ),
      ).toEqual(['rename_webhook', 'replay_webhook']);
    });

    it('should read the workspace feature flags once per listing', async () => {
      const { definedToolRegistryService, featureFlagService } =
        buildDefinedToolRegistryService({
          tools: [new ReplayWebhookTool(), new PauseWebhookTool()],
          isGranted: true,
          enabledFeatureFlags: [
            FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
            FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED,
          ],
        });

      expect(await listToolNames(definedToolRegistryService)).toEqual([
        'replay_webhook',
        'pause_webhook',
      ]);
      expect(
        featureFlagService.getWorkspaceFeatureFlagsMap,
      ).toHaveBeenCalledTimes(1);
      expect(
        featureFlagService.getWorkspaceFeatureFlagsMap,
      ).toHaveBeenCalledWith(context.workspaceId);
    });
  });

  describe('execute', () => {
    it('should run the tool with its parsed input when every flag is granted', async () => {
      const { definedToolRegistryService, definedTool } =
        buildRenameWebhookTool({ isGranted: true });

      const output = await definedToolRegistryService.execute({
        definedTool,
        args: { id: webhookId },
        context,
      });

      expect(output).toEqual({
        success: true,
        message: `Webhook ${webhookId} renamed`,
      });
    });

    it('should refuse the tool when a flag is no longer granted at call time', async () => {
      const { definedToolRegistryService, definedTool, tool } =
        buildRenameWebhookTool({ isGranted: false });
      const executeSpy = jest.spyOn(tool, 'execute');

      const output = await definedToolRegistryService.execute({
        definedTool,
        args: { id: webhookId },
        context,
      });

      expect(output).toMatchObject({
        success: false,
        message: 'Tool "rename_webhook" is not available',
      });
      expect(executeSpy).not.toHaveBeenCalled();
    });

    it('should refuse the tool when a feature flag is disabled at call time', async () => {
      const tool = new ReplayWebhookTool();
      const { definedToolRegistryService } = buildDefinedToolRegistryService({
        tools: [tool],
        isGranted: true,
      });
      const definedTool =
        definedToolRegistryService.findDefinedTool('replay_webhook');
      const executeSpy = jest.spyOn(tool, 'execute');

      jestExpectToBeDefined(definedTool);

      expect(
        await definedToolRegistryService.execute({
          definedTool,
          args: { id: webhookId },
          context,
        }),
      ).toMatchObject({
        success: false,
        message: 'Tool "replay_webhook" is not available',
      });
      expect(executeSpy).not.toHaveBeenCalled();
    });
  });
});
