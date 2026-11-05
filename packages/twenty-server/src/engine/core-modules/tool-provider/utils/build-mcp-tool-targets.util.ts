import { createHash } from 'crypto';

import { type McpToolTarget } from 'src/engine/core-modules/tool-provider/types/mcp-tool-target.type';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';

const MODEL_PROVIDER_TOOL_NAME_MAX_LENGTH = 64;
const NAME_HASH_LENGTH = 8;

const toSnakeCase = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const buildHashedMcpToolName = ({
  readableName,
  mcpServerId,
  toolName,
}: {
  readableName: string;
  mcpServerId: string;
  toolName: string;
}): string => {
  const hash = createHash('sha256')
    .update(`${mcpServerId}:${toolName}`)
    .digest('hex')
    .slice(0, NAME_HASH_LENGTH);

  return `${readableName.slice(0, MODEL_PROVIDER_TOOL_NAME_MAX_LENGTH - NAME_HASH_LENGTH - 1)}_${hash}`;
};

export const buildMcpToolTargets = (
  mcpServers: (McpToolTarget['mcpServer'] & Pick<FlatMcpServer, 'tools'>)[],
): McpToolTarget[] => {
  const candidates = mcpServers.flatMap((mcpServer) =>
    mcpServer.tools.map((tool) => ({
      mcpServer,
      tool,
      readableName: `mcp_${toSnakeCase(mcpServer.name)}_${toSnakeCase(tool.name)}`,
    })),
  );
  const candidateCountByReadableName = candidates.reduce(
    (counts, { readableName }) =>
      counts.set(readableName, (counts.get(readableName) ?? 0) + 1),
    new Map<string, number>(),
  );

  const targets = candidates.map(({ mcpServer, tool, readableName }) => {
    const isAmbiguousOrTooLong =
      readableName.length > MODEL_PROVIDER_TOOL_NAME_MAX_LENGTH ||
      (candidateCountByReadableName.get(readableName) ?? 0) > 1;

    return {
      mcpServer,
      tool,
      name: isAmbiguousOrTooLong
        ? buildHashedMcpToolName({
            readableName,
            mcpServerId: mcpServer.id,
            toolName: tool.name,
          })
        : readableName,
    };
  });

  return [...new Map(targets.map((target) => [target.name, target])).values()];
};
