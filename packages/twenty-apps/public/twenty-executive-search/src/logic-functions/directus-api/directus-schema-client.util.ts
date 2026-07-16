import { directusApiRequest } from 'src/logic-functions/directus-api/directus-api-request.util';
import { type DirectusApiConfig } from 'src/logic-functions/directus-api/get-directus-api-config.util';

/**
 * Directus Schema/Introspection API client.
 *
 * GET /items/{collection}?limit=0&meta=*   — field metadata for a collection
 * GET /collections                          — list all collections
 */

export type DirectusFieldMeta = {
  collection: string;
  field: string;
  type: string;
  schema: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
};

export type DirectusCollectionMeta = {
  collection: string;
  meta: Record<string, unknown> | null;
  schema: Record<string, unknown> | null;
};

export const getDirectusCollectionFields = ({
  config,
  collection,
}: {
  config: DirectusApiConfig;
  collection: string;
}) =>
  directusApiRequest<{ data: DirectusFieldMeta[] }>({
    config,
    path: `/items/${collection}?limit=0&meta=*`,
    method: 'GET',
  });

export const listDirectusCollections = ({
  config,
}: {
  config: DirectusApiConfig;
}) =>
  directusApiRequest<{ data: DirectusCollectionMeta[] }>({
    config,
    path: '/collections',
    method: 'GET',
  });
