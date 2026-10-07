import { z } from 'zod';

import { isNonEmptyString } from '@sniptt/guards';
import { type ToolCategory } from 'twenty-shared/ai';
import { toToolJsonSchema } from 'src/engine/core-modules/record-crud/utils/to-tool-json-schema.util';
import { type StaticToolSets } from 'src/engine/core-modules/tool-provider/types/static-tool-sets.type';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

export type ToolSetToDescriptorsOptions = {
  includeSchemas?: boolean;
  icon?: string;
};

export const humanizeToolName = (name: string): string =>
  name
    .split('_')
    .filter((word) => word.length > 0)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');

export const toolSetToDescriptors = (
  { readTools, writeTools }: StaticToolSets,
  category: ToolCategory,
  options?: ToolSetToDescriptorsOptions,
): (ToolIndexEntry | ToolDescriptor)[] => {
  const includeSchemas = options?.includeSchemas ?? true;

  const tools = [
    ...Object.entries(readTools).map(([name, tool]) => ({
      name,
      tool,
      isReadOnly: true,
    })),
    ...Object.entries(writeTools).map(([name, tool]) => ({
      name,
      tool,
      isReadOnly: false,
    })),
  ];

  return tools.map(({ name, tool, isReadOnly }) => {
    const base: ToolIndexEntry = {
      name,
      label: humanizeToolName(name),
      // A per-call description function needs a tool context the index lacks.
      description: isNonEmptyString(tool.description) ? tool.description : '',
      category,
      executionRef: { kind: 'static' as const, toolId: name },
      isReadOnly,
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
