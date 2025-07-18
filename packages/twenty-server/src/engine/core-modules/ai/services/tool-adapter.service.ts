import { Injectable } from '@nestjs/common';

import { ToolSet } from 'ai';

import { ToolRegistryService } from 'src/engine/core-modules/tool/tool-registry.service';
import { ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';

@Injectable()
export class ToolAdapterService {
  constructor(private readonly toolRegistryService: ToolRegistryService) {}

  generateToolsForWorkspace(workspaceId: string): ToolSet {
    const allTools = this.toolRegistryService.getAllTools();
    const tools = Array.from(allTools.entries()).reduce<ToolSet>(
      (acc, [toolType, tool]) => {
        acc[toolType.toLowerCase()] = {
          description: tool.description,
          parameters: tool.parameters,
          execute: async (parameters) => {
            const toolInput: ToolInput = {
              parameters: parameters.input,
              context: {
                workspaceId,
              },
            };
            const result = await tool.execute(toolInput);

            return result.result || result.error;
          },
        };

        return acc;
      },
      {},
    );

    return tools;
  }
}
