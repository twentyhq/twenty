import {
  EXECUTE_TOOL_TOOL_NAME,
  LEARN_TOOLS_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

import { WORKFLOW_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-system-prompts.const';

export const buildAgentSystemPrompt = (
  agentPrompt: string,
  toolCatalog: ToolIndexEntry[],
): string => {
  const parts: string[] = [WORKFLOW_SYSTEM_PROMPTS.BASE];

  if (toolCatalog.length > 0) {
    parts.push(buildToolCatalogSection(toolCatalog));
  }

  if (agentPrompt) {
    parts.push(agentPrompt);
  }

  return parts.join('\n\n');
};

const buildToolCatalogSection = (toolCatalog: ToolIndexEntry[]): string => {
  const objectNames = new Set<string>();
  const actionTools: ToolIndexEntry[] = [];
  const operationOrder: string[] = [];
  const seenOps = new Set<string>();

  for (const tool of toolCatalog) {
    if (tool.objectName && tool.operation) {
      objectNames.add(tool.objectName);

      if (!seenOps.has(tool.operation)) {
        seenOps.add(tool.operation);
        operationOrder.push(tool.operation);
      }
    } else {
      actionTools.push(tool);
    }
  }

  const lines: string[] = [
    `## Available Tools (${toolCatalog.length} total)`,
    '',
    `Use \`${LEARN_TOOLS_TOOL_NAME}\` to get the schema, then \`${EXECUTE_TOOL_TOOL_NAME}\` to call any tool below.`,
  ];

  if (objectNames.size > 0) {
    const sortedObjectNames = [...objectNames].sort();

    lines.push('');
    lines.push('### Database CRUD');
    lines.push('Operations per object:');
    lines.push(...operationOrder.map((op) => `- \`${op}_{object}\``));
    lines.push('');
    lines.push(`Objects (${sortedObjectNames.length}):`);
    lines.push(...sortedObjectNames.map((name) => `- \`${name}\``));
  }

  if (actionTools.length > 0) {
    lines.push('');
    lines.push('### Action Tools');
    lines.push(
      ...actionTools.map((tool) => `- \`${tool.name}\`: ${tool.description}`),
    );
  }

  return lines.join('\n');
};
