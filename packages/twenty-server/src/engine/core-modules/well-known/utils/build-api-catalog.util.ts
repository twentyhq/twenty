import { DOCUMENTATION_BASE_URL } from 'twenty-shared/constants';

const API_DOCS_URL = `${DOCUMENTATION_BASE_URL}/developers/extend/api`;
const MCP_DOCS_URL = `${DOCUMENTATION_BASE_URL}/user-guide/ai/capabilities/mcp`;

// service-desc points at each host's live OpenAPI, which is generated per
// workspace and so includes that workspace's custom objects.
export const buildApiCatalog = (baseUrl: string) => ({
  linkset: [
    {
      anchor: `${baseUrl}/rest`,
      'service-desc': [
        { href: `${baseUrl}/rest/open-api/core`, type: 'application/json' },
      ],
      'service-doc': [{ href: API_DOCS_URL, type: 'text/html' }],
      'service-meta': [
        {
          href: `${baseUrl}/.well-known/oauth-protected-resource`,
          type: 'application/json',
        },
      ],
    },
    {
      anchor: `${baseUrl}/rest/metadata`,
      'service-desc': [
        { href: `${baseUrl}/rest/open-api/metadata`, type: 'application/json' },
      ],
      'service-doc': [{ href: API_DOCS_URL, type: 'text/html' }],
    },
    {
      anchor: `${baseUrl}/graphql`,
      'service-doc': [{ href: API_DOCS_URL, type: 'text/html' }],
    },
    {
      anchor: `${baseUrl}/mcp`,
      'service-desc': [
        {
          href: `${baseUrl}/.well-known/mcp/server-card.json`,
          type: 'application/json',
        },
      ],
      'service-doc': [{ href: MCP_DOCS_URL, type: 'text/html' }],
    },
  ],
});
