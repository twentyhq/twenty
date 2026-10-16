import { INJECTABLE_WATERMARK } from '@nestjs/common/constants';

import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DEFINE_TOOL_METADATA_KEY } from 'src/engine/core-modules/tool-provider/constants/define-tool-metadata-key.constant';
import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

const renameWebhookInputSchema = z.object({ id: z.uuid() });

const RENAME_WEBHOOK_OPTIONS = {
  name: 'rename_webhook',
  category: ToolCategory.WEBHOOK,
  description: 'Rename a webhook.',
};

describe('DefineTool', () => {
  it('should make the tool injectable and record its options', () => {
    @DefineTool(RENAME_WEBHOOK_OPTIONS)
    class RenameWebhookTool extends BaseTool<typeof renameWebhookInputSchema> {
      readonly inputSchema = renameWebhookInputSchema;

      async execute(): Promise<ToolOutput> {
        return { success: true, message: 'Done' };
      }
    }

    expect(Reflect.getMetadata(INJECTABLE_WATERMARK, RenameWebhookTool)).toBe(
      true,
    );
    expect(
      Reflect.getMetadata(DEFINE_TOOL_METADATA_KEY, RenameWebhookTool),
    ).toEqual(RENAME_WEBHOOK_OPTIONS);
  });

  it('should only compile tools that follow the BaseTool contract', () => {
    // @ts-expect-error DefineTool only decorates classes extending BaseTool
    @DefineTool(RENAME_WEBHOOK_OPTIONS)
    class NotATool {}

    // @ts-expect-error matching members are not enough, the class must extend BaseTool
    @DefineTool(RENAME_WEBHOOK_OPTIONS)
    class LookAlikeTool {
      readonly inputSchema = renameWebhookInputSchema;

      async execute(): Promise<ToolOutput> {
        return { success: true, message: 'Done' };
      }
    }

    // @ts-expect-error execute must not require fields the inputSchema does not produce
    @DefineTool(RENAME_WEBHOOK_OPTIONS)
    class ToolWithNarrowedInput extends BaseTool<
      typeof renameWebhookInputSchema
    > {
      readonly inputSchema = renameWebhookInputSchema;

      async execute(input: { id: string; name: string }): Promise<ToolOutput> {
        return { success: true, message: input.name.toUpperCase() };
      }
    }

    // @ts-expect-error a tool must implement execute
    class ToolWithoutExecute extends BaseTool<typeof renameWebhookInputSchema> {
      readonly inputSchema = renameWebhookInputSchema;
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
      LookAlikeTool,
      ToolWithNarrowedInput,
      ToolWithoutExecute,
      ToolWithMismatchedInput,
      ToolWithScalarInput,
    ]).toHaveLength(6);
  });
});
