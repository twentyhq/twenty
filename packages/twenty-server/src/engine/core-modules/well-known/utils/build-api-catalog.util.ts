import {
  API_DOCS_URL,
  MCP_DOCS_URL,
} from 'src/engine/core-modules/well-known/constants/well-known.constants';
import { type ApiCatalogLinkset } from 'src/engine/core-modules/well-known/types/api-catalog-linkset.type';

// Indexes the API surfaces available on `baseUrl`. The REST OpenAPI documents
// are generated per workspace (they include each workspace's custom objects),
// so service-desc points at the live per-host endpoint rather than a static
// snapshot. service-meta links the REST base to its OAuth resource metadata.
export const buildApiCatalog = (baseUrl: string): ApiCatalogLinkset => ({
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
