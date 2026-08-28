/* @license Enterprise */

import { ToolCategory } from 'twenty-shared/ai';

import {
  getApiType,
  withApiRequestContext,
} from 'src/engine/core-modules/usage/storage/api-request-context.storage';

// GraphQL and REST expose core and metadata on separate paths, so the middleware
// already attributes them precisely. MCP serves both from a single endpoint, and
// only the dispatched tool tells them apart. Nested dispatches keep the outermost
// attribution: a metadata tool reading records stays metadata usage.
export const withToolCategoryApiRequestContext = async <T>(
  category: ToolCategory,
  execute: () => Promise<T>,
): Promise<T> => {
  if (getApiType() !== 'CORE_MCP' || category === ToolCategory.DATABASE_CRUD) {
    return execute();
  }

  return withApiRequestContext<T>('META_MCP', execute);
};
