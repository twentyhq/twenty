const normalizeToolNamePart = (part: string): string =>
  part
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

export const buildMcpToolName = ({
  mcpServerName,
  toolName,
}: {
  mcpServerName: string;
  toolName: string;
}): string =>
  `mcp_${normalizeToolNamePart(mcpServerName)}_${normalizeToolNamePart(toolName)}`;
