import { type McpToolMode } from 'src/engine/api/mcp/types/mcp-tool-mode.type';

export const parseMcpToolMode = (mode: string | undefined): McpToolMode =>
  mode === 'direct' || mode === 'meta' ? mode : 'generic';
