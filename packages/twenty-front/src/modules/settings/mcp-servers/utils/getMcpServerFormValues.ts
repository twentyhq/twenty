import { type McpServerFormValues } from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';
import { type McpServer } from '~/generated-metadata/graphql';

export const getMcpServerFormValues = (
  mcpServer: Pick<McpServer, 'label' | 'name' | 'url' | 'connectionProviderId'>,
): McpServerFormValues => ({
  label: mcpServer.label,
  name: mcpServer.name,
  url: mcpServer.url,
  connectionProviderId: mcpServer.connectionProviderId ?? null,
});
