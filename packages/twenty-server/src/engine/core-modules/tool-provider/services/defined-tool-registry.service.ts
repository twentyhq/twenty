import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { type ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { toToolJsonSchema } from 'src/engine/core-modules/record-crud/utils/to-tool-json-schema.util';
import { DEFINE_TOOL_METADATA_KEY } from 'src/engine/core-modules/tool-provider/constants/define-tool-metadata-key.constant';
import { TOOL_PROVIDERS } from 'src/engine/core-modules/tool-provider/constants/tool-providers.token';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool';
import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type DefineToolOptions } from 'src/engine/core-modules/tool-provider/types/define-tool-options.type';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { buildInvalidToolArgumentsOutput } from 'src/engine/core-modules/tool-provider/utils/build-invalid-tool-arguments-output.util';
import { humanizeToolName } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

const TOOL_NAME_PATTERN = /^[a-z][a-z0-9_]*$/;

type DefinedTool = {
  options: DefineToolOptions;
  tool: BaseTool;
  inputJsonSchema: object;
};

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

  isDefinedTool(toolName: string): boolean {
    return this.definedToolsByName.has(toolName);
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
    toolName: string,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    const definedTool = this.definedToolsByName.get(toolName);

    if (!isDefined(definedTool)) {
      throw new Error(`No @DefineTool tool is registered as "${toolName}"`);
    }

    const parsedInput = await definedTool.tool.inputSchema.safeParseAsync(args);

    if (!parsedInput.success) {
      return buildInvalidToolArgumentsOutput({
        toolName,
        error: parsedInput.error,
      });
    }

    return definedTool.tool.execute(parsedInput.data, context);
  }

  private register(options: DefineToolOptions, instance: unknown): void {
    const { name, category } = options;

    if (!(instance instanceof BaseTool)) {
      throw new Error(
        `@DefineTool "${name}" must decorate a singleton provider that extends BaseTool`,
      );
    }

    if (!TOOL_NAME_PATTERN.test(name)) {
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

    let inputJsonSchema: object;

    try {
      inputJsonSchema = toToolJsonSchema(instance.inputSchema);
    } catch (error) {
      throw new Error(
        `@DefineTool "${name}" has an inputSchema that cannot be converted to JSON schema: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    this.definedToolsByName.set(name, {
      options,
      tool: instance,
      inputJsonSchema,
    });
  }
}
