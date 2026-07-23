import { ToolCategory } from 'twenty-shared/ai';

import {
  EXECUTE_TOOL_TOOL_NAME,
  LEARN_TOOLS_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

const CATEGORY_LABELS: Partial<Record<ToolCategory, string>> = {
  [ToolCategory.DATABASE_CRUD]: 'Database Tools (CRUD operations)',
  [ToolCategory.ACTION]: 'Action Tools (HTTP, Email, etc.)',
};

const buildDatabaseCrudSection = (
  tools: ToolIndexEntry[],
  label: string,
): string => {
  const operationOrder: string[] = [];
  const seenOperations = new Set<string>();
  const objectNames = new Set<string>();
  const standaloneToolNames: string[] = [];

  for (const tool of tools) {
    if (tool.objectName && tool.operation) {
      objectNames.add(tool.objectName);

      if (!seenOperations.has(tool.operation)) {
        seenOperations.add(tool.operation);
        operationOrder.push(tool.operation);
      }
    } else {
      standaloneToolNames.push(tool.name);
    }
  }

  const lines: string[] = [`### ${label} (${tools.length} tools)`];

  if (objectNames.size > 0) {
    const sortedObjectNames = [...objectNames].sort();
    const findManyExample = tools.find(
      (tool) => tool.operation === 'find_many',
    );
    const findOneExample = tools.find(
      (tool) =>
        tool.operation === 'find_one' &&
        tool.objectName === findManyExample?.objectName,
    );
    const example =
      findManyExample && findOneExample
        ? ` e.g. \`${findManyExample.name}\` / \`${findOneExample.name}\``
        : '';

    lines.push('Operations per object:');
    lines.push(
      ...operationOrder.map((operation) => `- \`${operation}_{object}\``),
    );
    lines.push(`\nObjects (${sortedObjectNames.length}):`);
    lines.push(...sortedObjectNames.map((name) => `- \`${name}\``));
    lines.push(
      `\nTool name = operation + object name. \`*_many_*\` operations use the plural form, \`*_one_*\` use the singular form.${example}`,
    );
  }

  for (const toolName of standaloneToolNames.sort()) {
    lines.push(`- \`${toolName}\``);
  }

  return lines.join('\n');
};

// Renders the workflow agent's tool catalog (names only, no schemas) into a
// compact system-prompt section. Schemas are fetched on demand via learn_tools,
// which is what keeps the agent's context small.
export const buildWorkflowAgentToolCatalogSection = (
  toolCatalog: ToolIndexEntry[],
  preloadedToolNames: string[],
): string => {
  if (toolCatalog.length === 0) {
    return '';
  }

  const toolsByCategory = new Map<ToolCategory, ToolIndexEntry[]>();

  for (const tool of toolCatalog) {
    const existing = toolsByCategory.get(tool.category) ?? [];

    existing.push(tool);
    toolsByCategory.set(tool.category, existing);
  }

  const sections: string[] = [
    `## Available Tools

You can access ${toolCatalog.length} tools, discovered on demand to keep this prompt small. Before calling a tool you have not loaded yet, call \`${LEARN_TOOLS_TOOL_NAME}({ toolNames: [...] })\` to get its input schema, then call \`${EXECUTE_TOOL_TOOL_NAME}({ toolName, arguments })\` to run it. Pass every tool you need in a single \`${LEARN_TOOLS_TOOL_NAME}\` call.`,
  ];

  if (preloadedToolNames.length > 0) {
    sections.push(
      `### Ready to use now (call directly, no ${LEARN_TOOLS_TOOL_NAME} needed)\n${preloadedToolNames
        .map((name) => `- \`${name}\` ✓`)
        .join('\n')}`,
    );
  }

  for (const category of Object.values(ToolCategory)) {
    const tools = toolsByCategory.get(category);

    if (!tools || tools.length === 0) {
      continue;
    }

    const label = CATEGORY_LABELS[category] ?? category;

    if (category === ToolCategory.DATABASE_CRUD) {
      sections.push(buildDatabaseCrudSection(tools, label));
    } else {
      sections.push(
        `### ${label} (${tools.length} tools)\n${tools
          .map((tool) => `- \`${tool.name}\``)
          .join('\n')}`,
      );
    }
  }

  return sections.join('\n\n');
};
