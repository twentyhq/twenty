import { type z } from 'zod';

import { type mcpConnectorDirectoryEntrySchema } from './mcp-connector-directory-entry.schema';

export type McpConnectorDirectoryEntry = z.infer<
  typeof mcpConnectorDirectoryEntrySchema
>;
