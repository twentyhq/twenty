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
    expect(result.error).toBe(
      'Tool "create_one_workflow" is not available in this context and cannot be called here. Do not retry it.',
    );
  });

  it('does not append the discovery hint when refusing a tool', async () => {
    const toolRegistry = buildRegistry();

    const executeTool = createExecuteToolTool(toolRegistry, context, {
      isToolAllowed: () => false,
      discoveryHint: 'Use get_tool_catalog with a query.',
    });

    const result = await executeTool.execute({
      toolName: 'code_interpreter',
      arguments: {},
    });

    expect(result.error).toBe(
      'Tool "code_interpreter" is not available in this context and cannot be called here. Do not retry it.',
    );
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

  describe('when the registry does not know the tool', () => {
    const NOT_FOUND_RESULT = {
      success: false,
      message: 'Tool "find_many_persons" not found',
      error:
        'Tool "find_many_persons" not found. Did you mean: find_many_people? Pass your best candidate name to learn_tools to confirm it before executing.',
    };

    const buildNotFoundRegistry = () =>
      ({
        resolveAndExecute: jest.fn().mockResolvedValue(NOT_FOUND_RESULT),
      }) as unknown as ToolRegistryService;

    it('appends the caller discovery hint', async () => {
      const executeTool = createExecuteToolTool(
        buildNotFoundRegistry(),
        context,
        { discoveryHint: 'Use get_tool_catalog with a query.' },
      );

      const result = await executeTool.execute({
        toolName: 'find_many_persons',
        arguments: {},
      });

      expect(result).toEqual({
        ...NOT_FOUND_RESULT,
        error: `${NOT_FOUND_RESULT.error} Use get_tool_catalog with a query.`,
      });
    });

    it('returns the registry result untouched when no hint is supplied', async () => {
      const executeTool = createExecuteToolTool(
        buildNotFoundRegistry(),
        context,
      );

      const result = await executeTool.execute({
        toolName: 'find_many_persons',
        arguments: {},
      });

      expect(result).toBe(NOT_FOUND_RESULT);
    });

    it('leaves failures of a known tool untouched even with a hint', async () => {
      const executionFailure = {
        success: false,
        message: 'Failed to execute find_many_people',
        error: 'Invalid filter',
      };
      const toolRegistry = {
        resolveAndExecute: jest.fn().mockResolvedValue(executionFailure),
      } as unknown as ToolRegistryService;

      const executeTool = createExecuteToolTool(toolRegistry, context, {
        discoveryHint: 'Use get_tool_catalog with a query.',
      });

      const result = await executeTool.execute({
        toolName: 'find_many_people',
        arguments: {},
      });

      expect(result).toBe(executionFailure);
    });
  });
});
