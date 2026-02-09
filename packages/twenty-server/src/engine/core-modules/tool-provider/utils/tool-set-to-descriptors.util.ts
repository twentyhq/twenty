import { type ToolSet } from 'ai';
import { z } from 'zod';

import { type ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';

// Converts a ToolSet (with Zod schemas and closures) into an array of
// serializable ToolDescriptor objects. Used by providers that delegate to
// existing factory services (workflow, view, dashboard, metadata).
export const toolSetToDescriptors = (
  toolSet: ToolSet,
  category: ToolCategory,
): ToolDescriptor[] => {
  return Object.entries(toolSet).map(([name, tool]) => {
    let inputSchema: object;

    try {
      inputSchema = z.toJSONSchema(tool.inputSchema as z.ZodType);
    } catch {
      // Fallback: schema is already JSON Schema or another format
      inputSchema = (tool.inputSchema ?? {}) as object;
    }

    return {
      name,
      description: tool.description ?? '',
      category,
      inputSchema,
      executionRef: { kind: 'static' as const, toolId: name },
    };
  });
};
