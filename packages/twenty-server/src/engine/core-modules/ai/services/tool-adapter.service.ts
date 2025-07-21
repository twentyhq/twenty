import { Injectable } from '@nestjs/common';

import { ToolSet } from 'ai';

import { TOOLS } from 'src/engine/core-modules/tool/constants/tools.const';

@Injectable()
export class ToolAdapterService {
  getCoreTools(): ToolSet {
    const tools = Array.from(TOOLS.entries()).reduce<ToolSet>(
      (acc, [toolType, tool]) => {
        acc[toolType.toLowerCase()] = {
          description: tool.description,
          parameters: tool.parameters,
          execute: async (parameters) => {
            const response = await tool.execute(parameters.input);

            return response;
          },
        };

        return acc;
      },
      {},
    );

    return tools;
  }
}
