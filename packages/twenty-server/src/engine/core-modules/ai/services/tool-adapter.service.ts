import { Injectable } from '@nestjs/common';

import { ToolSet } from 'ai';

import { TOOLS } from 'src/engine/core-modules/tool/constants/tools.const';
import { ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';

@Injectable()
export class ToolAdapterService {
  generateToolsForWorkspace(workspaceId: string): ToolSet {
    const tools = Array.from(TOOLS.entries()).reduce<ToolSet>(
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
