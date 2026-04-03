import { type ToolSet } from 'ai';
import { z } from 'zod';

import { type ToolCategory } from 'twenty-shared/ai';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

export type ToolSetToDescriptorsOptions = {
  includeSchemas?: boolean;
  icon?: string;
};

// Converts a ToolSet (with Zod schemas and closures) into an array of
// serializable ToolDescriptor objects. Used by providers that delegate to
// existing factory services (workflow, view, dashboard, metadata).
export const toolSetToDescriptors = (
  toolSet: ToolSet,
  category: ToolCategory,
  options?: ToolSetToDescriptorsOptions,
): (ToolIndexEntry | ToolDescriptor)[] => {
  const includeSchemas = options?.includeSchemas ?? true;

  return Object.entries(toolSet).map(([name, tool]) => {
    const base: ToolIndexEntry = {
      name,
      description: tool.description ?? '',
      category,
      executionRef: { kind: 'static' as const, toolId: name },
      ...(options?.icon && { icon: options.icon }),
    };

    if (!includeSchemas) {
      return base;
    }

    let inputSchema: object;

    try {
      inputSchema = z.toJSONSchema(tool.inputSchema as z.ZodType);
    } catch {
      // Fallback: schema is already JSON Schema or another format
      inputSchema = (tool.inputSchema ?? {}) as object;
    }

    return {
      ...base,
      inputSchema,
    };
  });
};
