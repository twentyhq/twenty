import { Injectable } from '@nestjs/common';

import { Tool } from './interfaces/tool.interface';

export enum ToolType {
  HTTP_REQUEST = 'HTTP_REQUEST',
}

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
