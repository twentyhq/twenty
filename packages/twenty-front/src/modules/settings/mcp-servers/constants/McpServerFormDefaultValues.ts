import { type McpServerFormValues } from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';

export const MCP_SERVER_FORM_DEFAULT_VALUES: McpServerFormValues = {
  label: '',
  name: '',
  url: '',
  connectionProviderId: null,
};
