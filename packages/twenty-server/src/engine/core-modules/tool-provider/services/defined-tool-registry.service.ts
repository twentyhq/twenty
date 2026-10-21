import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { type ToolCategory } from 'twenty-shared/ai';
import { type PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { DEFINE_TOOL_METADATA_KEY } from 'src/engine/core-modules/tool-provider/constants/define-tool-metadata-key.constant';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type DefineToolOptions } from 'src/engine/core-modules/tool-provider/types/define-tool-options.type';
import { type DefinedTool } from 'src/engine/core-modules/tool-provider/types/defined-tool.type';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { buildInvalidToolArgumentsOutput } from 'src/engine/core-modules/tool-provider/utils/build-invalid-tool-arguments-output.util';
import { buildToolInputJsonSchemaOrThrow } from 'src/engine/core-modules/tool-provider/utils/build-tool-input-json-schema-or-throw.util';
import { buildToolNotAvailableOutput } from 'src/engine/core-modules/tool-provider/utils/build-tool-not-available-output.util';
import { isSnakeCaseToolName } from 'src/engine/core-modules/tool-provider/utils/is-snake-case-tool-name.util';
import { humanizeToolName } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
export class DefinedToolRegistryService implements OnModuleInit {
  private readonly definedToolsByName = new Map<string, DefinedTool>();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly permissionsService: PermissionsService,
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

  async getAvailableDescriptors(
    context: ToolProviderContext,
    {
      categories,
      includeSchemas,
    }: { categories?: ToolCategory[]; includeSchemas: boolean },
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    const requestedTools = [...this.definedToolsByName.values()].filter(
      ({ options }) =>
        !isDefined(categories) || categories.includes(options.category),
    );

    const grantedByPermissionFlag = new Map<
      PermissionFlagType,
      Promise<boolean>
    >();

    const isAvailableByTool = await Promise.all(
      requestedTools.map((definedTool) =>
        this.isAvailable(definedTool, context, grantedByPermissionFlag),
      ),
    );

    return requestedTools
      .filter((_, index) => isAvailableByTool[index])
      .map(({ options: { name, description, category }, inputJsonSchema }) => {
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
    definedTool: DefinedTool,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    const { options, tool } = definedTool;

    if (!(await this.isAvailable(definedTool, context))) {
      return buildToolNotAvailableOutput(options.name);
    }

    const parsedInput = await tool.inputSchema.safeParseAsync(args);

    if (!parsedInput.success) {
      return buildInvalidToolArgumentsOutput({
        toolName: options.name,
        error: parsedInput.error,
      });
    }

    return tool.execute(parsedInput.data, context);
  }

  private async isAvailable(
    { options: { requiredPermissionFlags } }: DefinedTool,
    context: ToolProviderContext,
    grantedByPermissionFlag = new Map<PermissionFlagType, Promise<boolean>>(),
  ): Promise<boolean> {
    const grants = await Promise.all(
      requiredPermissionFlags.map((permissionFlag) => {
        const cachedGrant = grantedByPermissionFlag.get(permissionFlag);

        if (isDefined(cachedGrant)) {
          return cachedGrant;
        }

        const grant = this.permissionsService.checkRolesPermissions(
          context.rolePermissionConfig,
          context.workspaceId,
          permissionFlag,
        );

        grantedByPermissionFlag.set(permissionFlag, grant);

        return grant;
      }),
    );

    return grants.every((isGranted) => isGranted);
  }

  private register(options: DefineToolOptions, instance: unknown): void {
    const { name } = options;

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
