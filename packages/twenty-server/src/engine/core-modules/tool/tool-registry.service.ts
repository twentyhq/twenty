import { Injectable } from '@nestjs/common';

import { ToolType } from 'src/engine/core-modules/tool/enums/tool-type.enum';

import { Tool } from './types/tool.type';

@Injectable()
export class ToolRegistryService {
  private tools = new Map<ToolType, Tool>();

  registerTool(type: ToolType, tool: Tool): void {
    this.tools.set(type, tool);
  }

  getTool(type: ToolType): Tool | undefined {
    return this.tools.get(type);
  }

  getAllTools(): Map<ToolType, Tool> {
    return this.tools;
  }
}
