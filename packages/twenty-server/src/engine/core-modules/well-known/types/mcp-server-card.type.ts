// Shape of an MCP Server Card served at /.well-known/mcp/server-card.json
// (SEP-2127), a subset of the MCP registry server schema. Discovery documents
// advertise endpoint + transport metadata only; primitives (tools/resources)
// and the auth handshake are negotiated at connect time.

export type McpServerCardRemoteHeader = {
  name: string;
  description?: string;
  isRequired?: boolean;
  isSecret?: boolean;
};

export type McpServerCardRemote = {
  type: 'streamable-http' | 'sse';
  url: string;
  supportedProtocolVersions?: string[];
  headers?: McpServerCardRemoteHeader[];
};

export type McpServerCardRepository = {
  url: string;
  source: string;
};

export type McpServerCard = {
  $schema: string;
  name: string;
  version: string;
  title: string;
  description: string;
  websiteUrl: string;
  repository: McpServerCardRepository;
  remotes: McpServerCardRemote[];
};
