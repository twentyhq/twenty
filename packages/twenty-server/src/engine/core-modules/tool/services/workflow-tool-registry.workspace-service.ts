import { Injectable } from '@nestjs/common';

import { ToolExecutionOptions, type ToolSet } from 'ai';

@Injectable()
export class WorkflowToolRegistryService {
  private readonly dynamicTools: Map<string, ToolSet[string]> = new Map();

  registerTool(name: string, tool: ToolSet[string]): void {
    this.dynamicTools.set(name, tool);
  }

  async executeTool(
    name: string,
    params: unknown,
    options: ToolExecutionOptions,
  ) {
    const tool = this.dynamicTools.get(name);

    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    if (!tool.execute) {
      throw new Error(`Tool ${name} does not have an execute method`);
    }

    return tool.execute(params, options);
  }

  getToolDefinition(name: string): ToolSet[string] | undefined {
    return this.dynamicTools.get(name);
  }

  getRegisteredToolNames(): string[] {
    return Array.from(this.dynamicTools.keys());
  }

  hasTool(name: string): boolean {
    return this.dynamicTools.has(name);
  }

  getAllToolDefinitions(): ToolSet[string][] {
    return Array.from(this.dynamicTools.values());
  }

  clearTools(): void {
    this.dynamicTools.clear();
  }
}
