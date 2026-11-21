import { type z } from 'zod';

import { type mcpRegistryServerSchema } from './mcp-registry-server.schema';

export type McpRegistryServer = z.infer<typeof mcpRegistryServerSchema>;
