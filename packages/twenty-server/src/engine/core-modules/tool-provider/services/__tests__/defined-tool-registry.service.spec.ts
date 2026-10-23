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
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

const webhookId = '2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e';

const context: ToolProviderContext = {
  workspaceId: 'workspace-id',
  rolePermissionConfig: {
    intersectionOf: { userWorkspaceRoleId: 'member-role-id' },
  },
  authPrincipalVariant: { kind: 'userSession', variant: 'standard' },
};

const WEBHOOK_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: true,
    apiKey: true,
    oauthClient: true,
    application: true,
  },
  requiredPermissionFlags: [PermissionFlagType.API_KEYS_AND_WEBHOOKS],
};

const renameWebhookInputSchema = z.object({ id: z.uuid() });

@DefineTool({
  name: 'rename_webhook',
  category: ToolCategory.WEBHOOK,
  description: 'Rename a webhook.',
  accessPolicy: WEBHOOK_ACCESS_POLICY,
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
  accessPolicy: WEBHOOK_ACCESS_POLICY,
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
  accessPolicy: {
    ...WEBHOOK_ACCESS_POLICY,
    requiredFeatureFlags: [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED],
  },
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
  accessPolicy: {
    ...WEBHOOK_ACCESS_POLICY,
    requiredFeatureFlags: [FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED],
  },
})
class PauseWebhookTool extends BaseTool<typeof pauseWebhookInputSchema> {
  readonly inputSchema = pauseWebhookInputSchema;

  async execute({
    input,
  }: ToolExecuteArgs<typeof pauseWebhookInputSchema>): Promise<ToolOutput> {
    return { success: true, message: `Webhook ${input.id} paused` };
  }
}

const rotateWebhookSecretInputSchema = z.object({ id: z.uuid() });

@DefineTool({
  name: 'rotate_webhook_secret',
  category: ToolCategory.WEBHOOK,
  description: 'Rotate a webhook signing secret.',
  accessPolicy: {
    ...WEBHOOK_ACCESS_POLICY,
    authPrincipals: {
      ...WEBHOOK_ACCESS_POLICY.authPrincipals,
      application: false,
    },
  },
})
class RotateWebhookSecretTool extends BaseTool<
  typeof rotateWebhookSecretInputSchema
> {
  readonly inputSchema = rotateWebhookSecretInputSchema;

  async execute({
    input,
  }: ToolExecuteArgs<
    typeof rotateWebhookSecretInputSchema
  >): Promise<ToolOutput> {
    return { success: true, message: `Webhook ${input.id} secret rotated` };
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
  callerContext: ToolProviderContext = context,
) =>
  (
    await definedToolRegistryService.getAvailableDescriptors(callerContext, {
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

  describe('getAvailableDescriptors with auth principals', () => {
    const tools = [new RenameWebhookTool(), new RotateWebhookSecretTool()];

    it('should hide a tool from a principal its access policy refuses', async () => {
      const { definedToolRegistryService } = buildDefinedToolRegistryService({
        tools,
        isGranted: true,
      });

      expect(
        await listToolNames(definedToolRegistryService, {
          ...context,
          authPrincipalVariant: {
            kind: 'application',
            variant: 'withoutUser',
            withAgent: false,
          },
        }),
      ).toEqual(['rename_webhook']);
    });

    it('should not count the agent a caller acts through against the access policy', async () => {
      const { definedToolRegistryService } = buildDefinedToolRegistryService({
        tools,
        isGranted: true,
      });

      expect(
        await listToolNames(definedToolRegistryService, {
          ...context,
          authPrincipalVariant: {
            kind: 'application',
            variant: 'withUser',
            withAgent: true,
          },
        }),
      ).toEqual(['rename_webhook']);
    });

    it('should list no tool to a caller with no principal', async () => {
      const { definedToolRegistryService } = buildDefinedToolRegistryService({
        tools,
        isGranted: true,
      });

      expect(
        await listToolNames(definedToolRegistryService, {
          ...context,
          authPrincipalVariant: undefined,
        }),
      ).toEqual([]);
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

    it('should refuse the tool to a principal its access policy refuses', async () => {
      const tool = new RotateWebhookSecretTool();
      const { definedToolRegistryService } = buildDefinedToolRegistryService({
        tools: [tool],
        isGranted: true,
      });
      const definedTool = definedToolRegistryService.findDefinedTool(
        'rotate_webhook_secret',
      );
      const executeSpy = jest.spyOn(tool, 'execute');

      jestExpectToBeDefined(definedTool);

      expect(
        await definedToolRegistryService.execute({
          definedTool,
          args: { id: webhookId },
          context: { ...context, authPrincipalVariant: { kind: 'apiKey' } },
        }),
      ).toMatchObject({ success: true });
      expect(
        await definedToolRegistryService.execute({
          definedTool,
          args: { id: webhookId },
          context: {
            ...context,
            authPrincipalVariant: {
              kind: 'application',
              variant: 'withoutUser',
              withAgent: false,
            },
          },
        }),
      ).toMatchObject({
        success: false,
        message: 'Tool "rotate_webhook_secret" is not available',
      });
      expect(executeSpy).toHaveBeenCalledTimes(1);
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
