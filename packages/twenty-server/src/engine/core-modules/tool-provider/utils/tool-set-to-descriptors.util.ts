import { type ToolSet } from 'ai';
import { z } from 'zod';

import { type ToolCategory } from 'twenty-shared/ai';
import { toToolJsonSchema } from 'src/engine/core-modules/record-crud/utils/to-tool-json-schema.util';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

export type ToolSetToDescriptorsOptions = {
  includeSchemas?: boolean;
  icon?: string;
  labels?: Record<string, string>;
};

export const humanizeToolName = (name: string): string =>
  name
    .split('_')
    .filter((word) => word.length > 0)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');

export const toolSetToDescriptors = (
  toolSet: ToolSet,
  category: ToolCategory,
  options?: ToolSetToDescriptorsOptions,
): (ToolIndexEntry | ToolDescriptor)[] => {
  const includeSchemas = options?.includeSchemas ?? true;

  return Object.entries(toolSet).map(([name, tool]) => {
    const base: ToolIndexEntry = {
      name,
      label: options?.labels?.[name] ?? humanizeToolName(name),
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
      inputSchema = toToolJsonSchema(tool.inputSchema as z.ZodType);
    } catch {
      inputSchema = (tool.inputSchema ?? {}) as object;
    }

    return {
      ...base,
      inputSchema,
    };
  });
};
