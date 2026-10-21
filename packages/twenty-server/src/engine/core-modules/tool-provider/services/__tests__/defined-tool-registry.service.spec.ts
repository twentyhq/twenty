import { type DiscoveryService } from '@nestjs/core';

import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

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

const pinItemInputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('LINK'), link: z.url() }),
  z.object({ type: z.literal('FOLDER'), name: z.string() }),
]);

@DefineTool({
  name: 'pin_item',
  category: ToolCategory.NAVIGATION_MENU_ITEM,
  description: 'Pin an item to the sidebar.',
  requiredPermissionFlags: [],
})
class PinItemTool extends BaseTool<typeof pinItemInputSchema> {
  readonly inputSchema = pinItemInputSchema;

  async execute({
    input,
  }: ToolExecuteArgs<typeof pinItemInputSchema>): Promise<ToolOutput> {
    return {
      success: true,
      message:
        input.type === 'LINK'
          ? `Link ${input.link} pinned`
          : `Folder ${input.name} pinned`,
    };
  }
}

const registerDefinedTool = <TTool extends BaseTool>({
  tool,
  toolName,
  isGranted = true,
}: {
  tool: TTool;
  toolName: string;
  isGranted?: boolean;
}) => {
  const definedToolRegistryService = new DefinedToolRegistryService(
    {
      getProviders: () => [{ instance: tool, metatype: tool.constructor }],
    } as unknown as DiscoveryService,
    {
      checkRolesPermissions: jest.fn().mockResolvedValue(isGranted),
    } as unknown as PermissionsService,
  );

  definedToolRegistryService.onModuleInit();

  const definedTool = definedToolRegistryService.findDefinedTool(toolName);

  jestExpectToBeDefined(definedTool);

  return { definedToolRegistryService, definedTool };
};

describe('DefinedToolRegistryService', () => {
  describe('execute', () => {
    it('should run the tool with its parsed input when every flag is granted', async () => {
      const { definedToolRegistryService, definedTool } = registerDefinedTool({
        tool: new RenameWebhookTool(),
        toolName: 'rename_webhook',
      });

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
      const tool = new RenameWebhookTool();
      const { definedToolRegistryService, definedTool } = registerDefinedTool({
        tool,
        toolName: 'rename_webhook',
        isGranted: false,
      });
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

    it('should run the variant of a discriminated union input that matches', async () => {
      const { definedToolRegistryService, definedTool } = registerDefinedTool({
        tool: new PinItemTool(),
        toolName: 'pin_item',
      });

      const output = await definedToolRegistryService.execute({
        definedTool,
        args: { type: 'FOLDER', name: 'Sales' },
        context,
      });

      expect(output).toEqual({ success: true, message: 'Folder Sales pinned' });
    });

    it('should refuse a discriminated union input that matches no variant', async () => {
      const tool = new PinItemTool();
      const { definedToolRegistryService, definedTool } = registerDefinedTool({
        tool,
        toolName: 'pin_item',
      });
      const executeSpy = jest.spyOn(tool, 'execute');

      const output = await definedToolRegistryService.execute({
        definedTool,
        args: { type: 'RECORD', name: 'Sales' },
        context,
      });

      expect(output).toMatchObject({
        success: false,
        message: 'Invalid arguments for pin_item',
      });
      expect(executeSpy).not.toHaveBeenCalled();
    });
  });
});
