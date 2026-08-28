import { ToolCategory } from 'twenty-shared/ai';

import {
  getApiType,
  withApiRequestContext,
} from 'src/engine/core-modules/usage/storage/api-request-context.storage';
import { withToolCategoryApiRequestContext } from 'src/engine/core-modules/usage/utils/with-tool-category-api-request-context.util';

const dispatch = (category: ToolCategory) =>
  withToolCategoryApiRequestContext(category, async () => getApiType());

describe('withToolCategoryApiRequestContext', () => {
  it('keeps MCP record operations attributed to the core api', async () => {
    await withApiRequestContext('CORE_MCP', async () => {
      expect(await dispatch(ToolCategory.DATABASE_CRUD)).toBe('CORE_MCP');
    });
  });

  it.each([
    ToolCategory.METADATA,
    ToolCategory.WORKFLOW,
    ToolCategory.VIEW,
    ToolCategory.ROLE,
  ])('attributes MCP %s operations to the metadata api', async (category) => {
    await withApiRequestContext('CORE_MCP', async () => {
      expect(await dispatch(category)).toBe('META_MCP');
    });
  });

  it('keeps the outermost attribution when a metadata tool reads records', async () => {
    await withApiRequestContext('CORE_MCP', async () => {
      await withToolCategoryApiRequestContext(ToolCategory.WORKFLOW, () =>
        dispatch(ToolCategory.DATABASE_CRUD),
      ).then((apiType) => expect(apiType).toBe('META_MCP'));
    });
  });

  it.each(['CORE_GQL', 'CORE_REST'] as const)(
    'leaves %s untouched',
    async (apiType) => {
      await withApiRequestContext(apiType, async () => {
        expect(await dispatch(ToolCategory.METADATA)).toBe(apiType);
      });
    },
  );

  it('leaves tools dispatched outside an api request unattributed', async () => {
    expect(await dispatch(ToolCategory.METADATA)).toBeUndefined();
  });
});
