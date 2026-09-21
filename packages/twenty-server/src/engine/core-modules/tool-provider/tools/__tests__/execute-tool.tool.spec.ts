import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { createExecuteToolTool } from 'src/engine/core-modules/tool-provider/tools/execute-tool.tool';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';

describe('createExecuteToolTool', () => {
  const context = {} as ToolContext;

  const buildRegistry = () =>
    ({
      resolveAndExecute: jest
        .fn()
        .mockResolvedValue({ success: true, result: {} }),
    }) as unknown as ToolRegistryService;

  it('executes tools the predicate allows', async () => {
    const toolRegistry = buildRegistry();

    const executeTool = createExecuteToolTool(toolRegistry, context, {
      isToolAllowed: (toolName) => toolName === 'find_many_people',
    });

    const result = await executeTool.execute({
      toolName: 'find_many_people',
      arguments: {},
    });

    expect(toolRegistry.resolveAndExecute).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  it('refuses tools the predicate rejects without touching the registry', async () => {
    const toolRegistry = buildRegistry();

    const executeTool = createExecuteToolTool(toolRegistry, context, {
      isToolAllowed: (toolName) => toolName === 'find_many_people',
    });

    const result = await executeTool.execute({
      toolName: 'create_one_workflow',
      arguments: {},
    });

    expect(toolRegistry.resolveAndExecute).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
  });

  it('executes any tool when no predicate is provided', async () => {
    const toolRegistry = buildRegistry();

    const executeTool = createExecuteToolTool(toolRegistry, context);

    const result = await executeTool.execute({
      toolName: 'find_many_people',
      arguments: {},
    });

    expect(toolRegistry.resolveAndExecute).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });
});
