import { z } from 'zod';

import { mcpRegistryServerSchema } from './mcp-registry-server.schema';

export const mcpConnectorDirectoryEntrySchema = z.object({
  server: mcpRegistryServerSchema,
  _meta: z.object({
    'com.anthropic.api/mcp-registry': z
      .object({
        displayName: z.string().nullish(),
        oneLiner: z.string().nullish(),
        author: z.object({ url: z.string().nullish() }).nullish(),
      })
      .nullish(),
  }),
});
