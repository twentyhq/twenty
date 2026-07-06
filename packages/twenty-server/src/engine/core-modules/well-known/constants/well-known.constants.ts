// RFC 9727 §2: an api-catalog is served with the Linkset media type
// (RFC 9264) carrying this profile so clients can recognise the document.
export const RFC_9727_PROFILE = 'https://www.rfc-editor.org/info/rfc9727';

export const API_CATALOG_CONTENT_TYPE = `application/linkset+json; profile="${RFC_9727_PROFILE}"`;

// MCP Server Card (SEP-2127) reuses the MCP registry server schema.
export const MCP_SERVER_CARD_SCHEMA =
  'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json';

// Reverse-DNS identifier under the domain Twenty controls, kept stable across
// hosts — only the remote URL varies per workspace.
export const MCP_SERVER_CARD_NAME = 'com.twenty/twenty';

export const MCP_SERVER_CARD_TITLE = 'Twenty CRM';

export const MCP_SERVER_CARD_DESCRIPTION =
  'Read and write your Twenty CRM data - companies, people, opportunities, tasks, notes and any custom objects - from AI assistants. Tools are discovered at runtime and scoped to the authenticated workspace.';

export const TWENTY_WEBSITE_URL = 'https://twenty.com';

export const TWENTY_REPOSITORY_URL = 'https://github.com/twentyhq/twenty';

export const API_DOCS_URL = 'https://docs.twenty.com/developers/extend/api';

export const MCP_DOCS_URL =
  'https://docs.twenty.com/user-guide/ai/capabilities/mcp';

// Discovery documents change only on deploy; let intermediaries cache briefly.
export const DISCOVERY_CACHE_CONTROL = 'public, max-age=3600';
