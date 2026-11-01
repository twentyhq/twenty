import { jsonSchema, type ToolSet } from 'ai';
import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { executeToolFromToolSet } from 'src/engine/core-modules/tool-provider/utils/execute-tool-from-tool-set.util';

const SUCCESS_OUTPUT = { success: true, message: 'Done' };

const buildToolSet = (tool: ToolSet[string]): ToolSet => ({
  create_agent: tool,
});

describe('executeToolFromToolSet', () => {
  it('should pass the parsed arguments to the tool', async () => {
    const execute = jest.fn().mockResolvedValue(SUCCESS_OUTPUT);

    const output = await executeToolFromToolSet(
      buildToolSet({
        inputSchema: z.object({
          label: z.string(),
          modelId: z.string().default('default-model'),
        }),
        execute,
      }),
      'create_agent',
      { label: 'Support agent', unknownKey: 'dropped' },
      ToolCategory.AGENT,
    );

    expect(output).toEqual(SUCCESS_OUTPUT);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith(
      { label: 'Support agent', modelId: 'default-model' },
      expect.anything(),
    );
  });

  it('should refuse arguments that do not match the input schema', async () => {
    const execute = jest.fn();

    const output = await executeToolFromToolSet(
      buildToolSet({
        inputSchema: z.object({ label: z.string(), roleId: z.uuid() }),
        execute,
      }),
      'create_agent',
      { label: 42, roleId: 'not-a-uuid' },
      ToolCategory.AGENT,
    );

    expect(execute).not.toHaveBeenCalled();
    expect(output.success).toBe(false);
    expect(output.message).toBe('Invalid arguments for create_agent');
    expect(output.error).toContain('label');
    expect(output.error).toContain('roleId');
  });

  it('should pass the arguments unchanged when the schema has no validator', async () => {
    const execute = jest.fn().mockResolvedValue(SUCCESS_OUTPUT);
    const args = { label: 42 };

    await executeToolFromToolSet(
      buildToolSet({
        inputSchema: jsonSchema({ type: 'object' }),
        execute,
      }),
      'create_agent',
      args,
      ToolCategory.AGENT,
    );

    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith(args, expect.anything());
  });

  it('should throw when the tool is not in the tool set', async () => {
    await expect(
      executeToolFromToolSet({}, 'create_agent', {}, ToolCategory.AGENT),
    ).rejects.toThrow(
      'Tool "create_agent" not found in ToolSet for category "AGENT"',
    );
  });
});
