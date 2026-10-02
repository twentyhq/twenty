import { tool } from 'ai';
import { ToolCategory } from 'twenty-shared/ai';
import { FieldMetadataType } from 'twenty-shared/types';
import { z } from 'zod';

import { executeToolFromToolSet } from 'src/engine/core-modules/tool-provider/utils/execute-tool-from-tool-set.util';

const buildToolSet = () => {
  const execute = jest
    .fn()
    .mockResolvedValue({ success: true, message: 'Field created' });

  return {
    execute,
    toolSet: {
      create_field_metadata: tool({
        inputSchema: z.object({
          name: z.string(),
          type: z.nativeEnum(FieldMetadataType),
        }),
        execute,
      }),
    },
  };
};

describe('executeToolFromToolSet', () => {
  it('should refuse input outside the tool schema without running the tool', async () => {
    const { execute, toolSet } = buildToolSet();

    const output = await executeToolFromToolSet(
      toolSet,
      'create_field_metadata',
      { name: 'isActive', type: 'CHECKBOX' },
      ToolCategory.METADATA,
    );

    expect(output.success).toBe(false);
    expect(output.message).toBe('Invalid input for create_field_metadata');
    expect(output.error).toContain('type');
    expect(execute).not.toHaveBeenCalled();
  });

  it('should run the tool when the input matches its schema', async () => {
    const { execute, toolSet } = buildToolSet();
    const input = { name: 'isActive', type: FieldMetadataType.BOOLEAN };

    const output = await executeToolFromToolSet(
      toolSet,
      'create_field_metadata',
      input,
      ToolCategory.METADATA,
    );

    expect(output).toEqual({ success: true, message: 'Field created' });
    expect(execute).toHaveBeenCalledWith(input, expect.anything());
  });
});
