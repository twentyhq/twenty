import { Inject, Injectable, Optional } from '@nestjs/common';
import { ToolCategory } from 'twenty-shared/ai';

import { AI_FRONT_COMPONENT_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/ai-front-component-service.token';
import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { executeToolFromToolSet } from 'src/engine/core-modules/tool-provider/utils/execute-tool-from-tool-set.util';
import { toolSetToDescriptors } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import type { AiFrontComponentService } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.service';

@Injectable()
export class FrontComponentToolProvider implements ToolProvider {
  readonly category = ToolCategory.FRONT_COMPONENT;

  constructor(
    @Optional()
    @Inject(AI_FRONT_COMPONENT_SERVICE_TOKEN)
    private readonly components: AiFrontComponentService | null,
  ) {}

  async isAvailable(context: ToolProviderContext): Promise<boolean> {
    return Object.keys(await this.buildToolSet(context)).length > 0;
  }

  async generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    return toolSetToDescriptors(
      await this.buildToolSet(context),
      this.category,
      {
        includeSchemas: options?.includeSchemas ?? true,
        icon: 'IconLayoutGridAdd',
      },
    ).map((descriptor) => {
      if (descriptor.name === 'publish_front_component') {
        return {
          ...descriptor,
          approval: { template: 'frontComponent' as const },
        };
      }
      return descriptor;
    });
  }

  async executeStaticTool(
    toolName: string,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    return executeToolFromToolSet(
      await this.buildToolSet(context),
      toolName,
      args,
      this.category,
    );
  }

  private async buildToolSet(context: ToolProviderContext) {
    return (await this.components?.generateTools(context)) ?? {};
  }
}
