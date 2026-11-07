import { createHash } from 'crypto';

import { type McpToolTarget } from 'src/engine/core-modules/tool-provider/types/mcp-tool-target.type';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';

const MODEL_PROVIDER_TOOL_NAME_MAX_LENGTH = 64;
const NAME_HASH_LENGTH = 8;
const NAME_SEPARATOR = '__';
const NAME_PREFIX = `mcp${NAME_SEPARATOR}`;

// The server part ends at the first separator only if it holds none and does not end with "_".
const canDelimitServerName = (mcpServerName: string): boolean =>
  !mcpServerName.includes(NAME_SEPARATOR) && !mcpServerName.endsWith('_');

// Depends on one server and one tool only, so adding a server or a tool never renames another.
// Both names are already provider-safe: snake_case server names, tool names sanitized on sync.
export const buildMcpToolName = ({
  mcpServer,
  toolName,
}: {
  mcpServer: Pick<FlatMcpServer, 'id' | 'name'>;
  toolName: string;
}): string => {
  const readableName = `${NAME_PREFIX}${mcpServer.name}${NAME_SEPARATOR}${toolName}`;

  if (
    canDelimitServerName(mcpServer.name) &&
    readableName.length <= MODEL_PROVIDER_TOOL_NAME_MAX_LENGTH
  ) {
    return readableName;
  }

  const hash = createHash('sha256')
    .update(`${mcpServer.id}:${toolName}`)
    .digest('hex')
    .slice(0, NAME_HASH_LENGTH);

  return `${readableName.slice(0, MODEL_PROVIDER_TOOL_NAME_MAX_LENGTH - NAME_HASH_LENGTH - 1)}_${hash}`;
};

export const buildMcpToolTargets = (
  mcpServers: (McpToolTarget['mcpServer'] & Pick<FlatMcpServer, 'tools'>)[],
): McpToolTarget[] => {
  const targets = mcpServers.flatMap((mcpServer) =>
    mcpServer.tools.map((tool) => ({
      name: buildMcpToolName({ mcpServer, toolName: tool.name }),
      mcpServer,
      tool,
    })),
  );

  return [...new Map(targets.map((target) => [target.name, target])).values()];
};
