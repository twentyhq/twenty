import { directusApiRequest } from 'src/logic-functions/directus-api/directus-api-request.util';
import { type DirectusApiConfig } from 'src/logic-functions/directus-api/get-directus-api-config.util';

/**
 * Directus Items API client.
 *
 * GET    /items/{collection}                — list items
 * GET    /items/{collection}/{id}           — retrieve single item
 * POST   /items/{collection}                — create item
 * PATCH  /items/{collection}/{id}           — update item
 * DELETE /items/{collection}/{id}           — delete item
 */

export const listDirectusItems = <TItem>({
  config,
  collection,
  params,
}: {
  config: DirectusApiConfig;
  collection: string;
  params?: Record<string, string>;
}) => {
  const searchParams = params
    ? `?${new URLSearchParams(params).toString()}`
    : '';

  return directusApiRequest<TItem[]>({
    config,
    path: `/items/${collection}${searchParams}`,
    method: 'GET',
  });
};

export const getDirectusItem = <TItem>({
  config,
  collection,
  id,
}: {
  config: DirectusApiConfig;
  collection: string;
  id: string | number;
}) =>
  directusApiRequest<TItem>({
    config,
    path: `/items/${collection}/${id}`,
    method: 'GET',
    allowNotFound: true,
  });

export const createDirectusItem = <TItem>({
  config,
  collection,
  body,
}: {
  config: DirectusApiConfig;
  collection: string;
  body: Record<string, unknown>;
}) =>
  directusApiRequest<TItem>({
    config,
    path: `/items/${collection}`,
    method: 'POST',
    body,
  });

export const updateDirectusItem = <TItem>({
  config,
  collection,
  id,
  body,
}: {
  config: DirectusApiConfig;
  collection: string;
  id: string | number;
  body: Record<string, unknown>;
}) =>
  directusApiRequest<TItem>({
    config,
    path: `/items/${collection}/${id}`,
    method: 'PATCH',
    body,
  });

export const deleteDirectusItem = ({
  config,
  collection,
  id,
}: {
  config: DirectusApiConfig;
  collection: string;
  id: string | number;
}) =>
  directusApiRequest<void>({
    config,
    path: `/items/${collection}/${id}`,
    method: 'DELETE',
  });
