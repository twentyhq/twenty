import { EXECUTE_TOOL_TOOL_NAME } from 'src/engine/core-modules/tool-provider/tools';

export const resolveToolName = (part: {
  toolName: string;
  input?: unknown;
}): string => {
  if (part.toolName !== EXECUTE_TOOL_TOOL_NAME) {
    return part.toolName;
  }

  const innerName = (part.input as { toolName?: unknown } | undefined)
    ?.toolName;

  return typeof innerName === 'string' && innerName.length > 0
    ? innerName
    : `${EXECUTE_TOOL_TOOL_NAME}:unknown`;
};
