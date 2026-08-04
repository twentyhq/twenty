export const API_PROXY_PREFIXES = [
  'graphql',
  'metadata',
  'admin-panel',
  'auth',
  'oauth',
  'client-config',
  'file',
  'files',
  'rest',
  's',
  'mcp',
  'healthz',
  'webhooks',
  'apps',
  'app',
  'emailing',
  'application-registration-claim',
  '\\.well-known',
];

export const buildApiProxyMatcher = (prefix: string) => `^/${prefix}($|[/?])`;
