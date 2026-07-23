import { type StepResult, type ToolSet } from 'ai';

import { resolveToolName } from 'src/engine/core-modules/tool-provider/utils/resolve-tool-name.util';

// Collects the registry tool names a workflow agent actually called during a
// run (execute_tool calls unwrapped to their underlying tool). Restricted to
// allowedToolNames so meta-tools (learn_tools) and native tools are ignored.
export const extractExecutedRegistryToolNames = (
  steps: StepResult<ToolSet>[],
  allowedToolNames: Set<string>,
): string[] => {
  const executedToolNames = new Set<string>();

  for (const step of steps) {
    for (const part of step.content) {
      if (part.type !== 'tool-call') {
        continue;
      }

      const toolName = resolveToolName(part);

      if (allowedToolNames.has(toolName)) {
        executedToolNames.add(toolName);
      }
    }
  }

  return [...executedToolNames];
};
