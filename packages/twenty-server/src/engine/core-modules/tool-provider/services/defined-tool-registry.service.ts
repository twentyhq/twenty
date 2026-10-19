import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { type ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { DEFINE_TOOL_METADATA_KEY } from 'src/engine/core-modules/tool-provider/constants/define-tool-metadata-key.constant';
import { TOOL_PROVIDERS } from 'src/engine/core-modules/tool-provider/constants/tool-providers.token';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type DefineToolOptions } from 'src/engine/core-modules/tool-provider/types/define-tool-options.type';
import { type DefinedTool } from 'src/engine/core-modules/tool-provider/types/defined-tool.type';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { buildInvalidToolArgumentsOutput } from 'src/engine/core-modules/tool-provider/utils/build-invalid-tool-arguments-output.util';
import { buildToolInputJsonSchemaOrThrow } from 'src/engine/core-modules/tool-provider/utils/build-tool-input-json-schema-or-throw.util';
import { isSnakeCaseToolName } from 'src/engine/core-modules/tool-provider/utils/is-snake-case-tool-name.util';
import { humanizeToolName } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

@Injectable()
export class DefinedToolRegistryService implements OnModuleInit {
  private readonly definedToolsByName = new Map<string, DefinedTool>();

  constructor(
    private readonly discoveryService: DiscoveryService,
    @Inject(TOOL_PROVIDERS)
    private readonly providers: ToolProvider[],
  ) {}

  onModuleInit() {
    for (const { instance, metatype } of this.discoveryService.getProviders()) {
      if (!isDefined(metatype)) {
        continue;
      }

      const options: DefineToolOptions | undefined = Reflect.getMetadata(
        DEFINE_TOOL_METADATA_KEY,
        metatype,
      );

      if (isDefined(options)) {
        this.register(options, instance);
      }
    }
  }

  findDefinedTool(toolName: string): DefinedTool | undefined {
    return this.definedToolsByName.get(toolName);
  }

  getDescriptors(
    category: ToolCategory,
    options?: GenerateDescriptorOptions,
  ): (ToolIndexEntry | ToolDescriptor)[] {
    const includeSchemas = options?.includeSchemas ?? true;

    return [...this.definedToolsByName.values()]
      .filter(
        (definedTool) =>
          definedTool.options.category === category &&
          (!isDefined(options?.toolNames) ||
            options.toolNames.has(definedTool.options.name)),
      )
      .map(({ options: { name, description }, inputJsonSchema }) => {
        const entry: ToolIndexEntry = {
          name,
          label: humanizeToolName(name),
          description,
          category,
          executionRef: { kind: 'static', toolId: name },
        };

        return includeSchemas
          ? { ...entry, inputSchema: inputJsonSchema }
          : entry;
      });
  }

  async execute(
    { options, tool }: DefinedTool,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    const parsedInput = await tool.inputSchema.safeParseAsync(args);

    if (!parsedInput.success) {
      return buildInvalidToolArgumentsOutput({
        toolName: options.name,
        error: parsedInput.error,
      });
    }

    return tool.execute(parsedInput.data, context);
  }

  private register(options: DefineToolOptions, instance: unknown): void {
    const { name, category } = options;

    if (!(instance instanceof BaseTool)) {
      throw new Error(
        `@DefineTool "${name}" must decorate a singleton provider that extends BaseTool`,
      );
    }

    if (!isSnakeCaseToolName(name)) {
      throw new Error(
        `@DefineTool "${name}" must be snake_case, for example "delete_webhook"`,
      );
    }

    if (this.definedToolsByName.has(name)) {
      throw new Error(`@DefineTool "${name}" is declared more than once`);
    }

    if (!this.providers.some((provider) => provider.category === category)) {
      throw new Error(
        `@DefineTool "${name}" uses category "${category}", which no ToolProvider gates, so it would never be listed`,
      );
    }

    const inputJsonSchema = buildToolInputJsonSchemaOrThrow({
      toolName: name,
      inputSchema: instance.inputSchema,
    });

    this.definedToolsByName.set(name, {
      options,
      tool: instance,
      inputJsonSchema,
    });
  }
}
