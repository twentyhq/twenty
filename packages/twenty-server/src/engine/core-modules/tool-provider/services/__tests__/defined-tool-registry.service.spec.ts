import { DiscoveryModule } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { TOOL_PROVIDERS } from 'src/engine/core-modules/tool-provider/constants/tool-providers.token';
import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { DefinedToolRegistryService } from 'src/engine/core-modules/tool-provider/services/defined-tool-registry.service';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

const CONTEXT = { workspaceId: 'workspace-id' } as ToolProviderContext;

const renameWebhookInputSchema = z.object({
  id: z.uuid(),
  label: z.string().default('Untitled'),
});

const executeRenameWebhook = jest.fn();

@DefineTool({
  name: 'rename_webhook',
  category: ToolCategory.WEBHOOK,
  description: 'Rename a webhook.',
})
class RenameWebhookTool extends BaseTool<typeof renameWebhookInputSchema> {
  readonly inputSchema = renameWebhookInputSchema;

  async execute(
    input: z.infer<typeof renameWebhookInputSchema>,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    return executeRenameWebhook(input, context);
  }
}

const emptyInputSchema = z.object({});

const buildRegistry = async (
  tools: (new () => BaseTool)[],
  providerCategories: ToolCategory[] = [ToolCategory.WEBHOOK],
) => {
  const module = await Test.createTestingModule({
    imports: [DiscoveryModule],
    providers: [
      DefinedToolRegistryService,
      ...tools,
      {
        provide: TOOL_PROVIDERS,
        useValue: providerCategories.map((category) => ({ category })),
      },
    ],
  }).compile();

  await module.init();

  return module.get(DefinedToolRegistryService);
};

describe('DefinedToolRegistryService', () => {
  beforeEach(() => {
    executeRenameWebhook.mockReset();
  });

  it('should describe the tools of a category with their JSON schema', async () => {
    const registry = await buildRegistry([RenameWebhookTool]);

    expect(registry.isDefinedTool('rename_webhook')).toBe(true);
    expect(registry.getDescriptors(ToolCategory.WEBHOOK)).toEqual([
      {
        name: 'rename_webhook',
        label: 'Rename Webhook',
        description: 'Rename a webhook.',
        category: ToolCategory.WEBHOOK,
        executionRef: { kind: 'static', toolId: 'rename_webhook' },
        inputSchema: expect.objectContaining({
          type: 'object',
          required: ['id'],
        }),
      },
    ]);
    expect(
      registry.getDescriptors(ToolCategory.WEBHOOK, { includeSchemas: false }),
    ).toEqual([
      expect.not.objectContaining({ inputSchema: expect.anything() }),
    ]);
    expect(registry.getDescriptors(ToolCategory.ROLE)).toEqual([]);
  });

  it('should execute the tool with the parsed input', async () => {
    const registry = await buildRegistry([RenameWebhookTool]);
    const webhookId = '0f1e2d3c-4b5a-4968-8776-655443322110';

    executeRenameWebhook.mockResolvedValue({ success: true, message: 'Done' });

    const output = await registry.execute(
      'rename_webhook',
      { id: webhookId, unknownKey: 'dropped' },
      CONTEXT,
    );

    expect(output).toEqual({ success: true, message: 'Done' });
    expect(executeRenameWebhook).toHaveBeenCalledTimes(1);
    expect(executeRenameWebhook).toHaveBeenCalledWith(
      { id: webhookId, label: 'Untitled' },
      CONTEXT,
    );
  });

  it('should refuse input that does not match the schema', async () => {
    const registry = await buildRegistry([RenameWebhookTool]);

    const output = await registry.execute(
      'rename_webhook',
      { id: 'not-a-uuid' },
      CONTEXT,
    );

    expect(executeRenameWebhook).not.toHaveBeenCalled();
    expect(output).toEqual({
      success: false,
      message: 'Invalid arguments for rename_webhook',
      error: expect.stringContaining('id'),
    });
  });

  it('should refuse to boot when two tools share a name', async () => {
    @DefineTool({
      name: 'rename_webhook',
      category: ToolCategory.WEBHOOK,
      description: 'Duplicate.',
    })
    class DuplicateRenameWebhookTool extends BaseTool<typeof emptyInputSchema> {
      readonly inputSchema = emptyInputSchema;

      async execute(): Promise<ToolOutput> {
        return { success: true, message: 'Done' };
      }
    }

    await expect(
      buildRegistry([RenameWebhookTool, DuplicateRenameWebhookTool]),
    ).rejects.toThrow(
      '@DefineTool "rename_webhook" is declared more than once',
    );
  });

  it('should refuse to boot when the name is not snake_case', async () => {
    @DefineTool({
      name: 'renameWebhook',
      category: ToolCategory.WEBHOOK,
      description: 'Camel case.',
    })
    class CamelCaseTool extends BaseTool<typeof emptyInputSchema> {
      readonly inputSchema = emptyInputSchema;

      async execute(): Promise<ToolOutput> {
        return { success: true, message: 'Done' };
      }
    }

    await expect(buildRegistry([CamelCaseTool])).rejects.toThrow(
      '@DefineTool "renameWebhook" must be snake_case',
    );
  });

  it('should refuse to boot when no provider gates the category', async () => {
    await expect(
      buildRegistry([RenameWebhookTool], [ToolCategory.ROLE]),
    ).rejects.toThrow('which no ToolProvider gates');
  });

  it('should only compile tools that follow the BaseTool contract', () => {
    // @ts-expect-error DefineTool only decorates classes extending BaseTool
    @DefineTool({
      name: 'not_a_tool',
      category: ToolCategory.WEBHOOK,
      description: 'Not a tool.',
    })
    class NotATool {}

    // @ts-expect-error a tool must implement execute
    class ToolWithoutExecute extends BaseTool<typeof emptyInputSchema> {
      readonly inputSchema = emptyInputSchema;
    }

    class ToolWithMismatchedInput extends BaseTool<
      typeof renameWebhookInputSchema
    > {
      readonly inputSchema = renameWebhookInputSchema;

      // @ts-expect-error execute input must match the inputSchema
      async execute(input: { name: number }): Promise<ToolOutput> {
        return { success: true, message: String(input.name) };
      }
    }

    // @ts-expect-error tool inputs must be zod objects
    class ToolWithScalarInput extends BaseTool<z.ZodString> {
      readonly inputSchema = z.string();

      async execute(): Promise<ToolOutput> {
        return { success: true, message: 'Done' };
      }
    }

    expect([
      NotATool,
      ToolWithoutExecute,
      ToolWithMismatchedInput,
      ToolWithScalarInput,
    ]).toHaveLength(4);
  });
});
