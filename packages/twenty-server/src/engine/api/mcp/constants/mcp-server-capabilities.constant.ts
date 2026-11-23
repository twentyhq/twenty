import { type ServerCapabilities } from '@modelcontextprotocol/server';

export const MCP_SERVER_CAPABILITIES = {
  tools: { listChanged: false },
  resources: { listChanged: false },
  prompts: { listChanged: false },
} as const satisfies ServerCapabilities;
