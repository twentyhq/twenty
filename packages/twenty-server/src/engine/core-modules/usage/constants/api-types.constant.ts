/* @license Enterprise */

import { ApiPath } from 'twenty-shared/types';

import { type ApiType } from 'src/engine/core-modules/usage/types/api-type.type';

export const API_TYPE_BY_PATH_PREFIX: Record<string, ApiType> = {
  [ApiPath.GraphQL]: 'CORE_GQL',
  [ApiPath.Rest]: 'CORE_REST',
  [ApiPath.Mcp]: 'MCP',
};
