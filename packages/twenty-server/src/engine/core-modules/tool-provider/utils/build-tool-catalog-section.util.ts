import { isNonEmptyString } from '@sniptt/guards';
import { ToolCategory } from 'twenty-shared/ai';
import { assertUnreachable, isNonEmptyArray } from 'twenty-shared/utils';

import {
  EXECUTE_TOOL_TOOL_NAME,
  LEARN_TOOLS_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import {
  collapseDatabaseCrudTools,
  DATABASE_CRUD_NAME_GRAMMAR,
  type DatabaseCrudObjectNames,
} from 'src/engine/core-modules/tool-provider/utils/collapse-database-crud-tools.util';

const getCategoryLabel = (category: ToolCategory): string => {
  switch (category) {
    case ToolCategory.DATABASE_CRUD:
      return 'Database Tools (CRUD operations)';
    case ToolCategory.ACTION:
      return 'Action Tools (HTTP, Email, etc.)';
    case ToolCategory.WORKFLOW:
      return 'Workflow Tools (create/manage workflows)';
    case ToolCategory.METADATA:
      return 'Metadata Tools (schema management)';
    case ToolCategory.VIEW:
      return 'View Tools (manage views, fields, filters, and sorts)';
    case ToolCategory.DASHBOARD:
      return 'Dashboard Tools (create/manage dashboards)';
    case ToolCategory.LOGIC_FUNCTION:
      return 'Logic Functions (custom tools)';
    case ToolCategory.NAVIGATION_MENU_ITEM:
      return 'Navigation Menu Item Tools (sidebar entries, folders, and user favorites)';
    case ToolCategory.WEBHOOK:
      return 'Webhook Tools (outgoing webhooks)';
    case ToolCategory.ROLE:
      return 'Role Tools (manage roles and permissions)';
    default:
      return assertUnreachable(category);
  }
};

const renderObjectNames = ({
  plural,
  singular,
}: DatabaseCrudObjectNames): string =>
  [plural, singular]
    .filter(isNonEmptyString)
    .map((name) => `\`${name}\``)
    .join(' / ');

const buildDatabaseCrudCatalogSection = (
  tools: ToolIndexEntry[],
  preloadedSet: Set<string>,
  categoryLabel: string,
): string => {
  const collapsed = collapseDatabaseCrudTools(tools);

  const lines: string[] = [`\n#### ${categoryLabel} (${tools.length} tools)`];

  if (collapsed.objectGroups.length > 0) {
    lines.push(
      `Operations available per object. An operation that is not listed for an object does not exist for it:`,
    );

    for (const group of collapsed.objectGroups) {
      lines.push(`\n${group.operations.map((op) => `\`${op}\``).join(' | ')}`);
      lines.push(
        ...group.objects.map((object) => `- ${renderObjectNames(object)}`),
      );
    }

    const examplePart = isNonEmptyArray(collapsed.exampleToolNames)
      ? ` e.g. \`${collapsed.exampleToolNames.join('` / `')}\``
      : '';

    lines.push(`\n${DATABASE_CRUD_NAME_GRAMMAR}${examplePart}`);
  }

  for (const tool of collapsed.standaloneTools) {
    const status = preloadedSet.has(tool.name) ? ' ✓' : '';

    lines.push(`- \`${tool.name}\`${status}`);
  }

  return lines.join('\n');
};

export const buildToolCatalogSection = (
  toolCatalog: ToolIndexEntry[],
  preloadedTools: string[],
): string => {
  const preloadedSet = new Set(preloadedTools);

  const toolsByCategory = new Map<string, ToolIndexEntry[]>();

  for (const tool of toolCatalog) {
    const category = tool.category;
    const existing = toolsByCategory.get(category) ?? [];

    existing.push(tool);
    toolsByCategory.set(category, existing);
  }

  const sections: string[] = [];

  const preloadedList =
    preloadedTools.length > 0
      ? preloadedTools.map((toolName) => `- \`${toolName}\` ✓`).join('\n')
      : '(none)';

  sections.push(`
## Available Tools

You have access to ${toolCatalog.length} tools. Some are pre-loaded and ready to use immediately.
To use any other tool, first call \`${LEARN_TOOLS_TOOL_NAME}\` to learn its schema, then call \`${EXECUTE_TOOL_TOOL_NAME}\` to run it.

### Pre-loaded Tools (ready to use now)
${preloadedList}

### Tool Catalog by Category`);

  const categoryOrder = Object.values(ToolCategory);

  for (const category of categoryOrder) {
    const tools = toolsByCategory.get(category);

    if (!tools || tools.length === 0) {
      continue;
    }

    const categoryLabel = getCategoryLabel(category);

    if (category === ToolCategory.DATABASE_CRUD) {
      sections.push(
        buildDatabaseCrudCatalogSection(tools, preloadedSet, categoryLabel),
      );
    } else {
      sections.push(`
#### ${categoryLabel} (${tools.length} tools)
${tools
  .map((tool) => {
    const status = preloadedSet.has(tool.name) ? ' ✓' : '';

    return `- \`${tool.name}\`${status}`;
  })
  .join('\n')}`);
    }
  }

  sections.push(`
### How to Use Tools
1. **Pre-loaded tools** (marked with ✓): Use directly
2. **Other tools**: First call \`${LEARN_TOOLS_TOOL_NAME}({toolNames: ["tool_name"]})\` to learn the schema, then call \`${EXECUTE_TOOL_TOOL_NAME}({toolName: "tool_name", arguments: {...}})\` to run it`);

  return sections.join('\n');
};
