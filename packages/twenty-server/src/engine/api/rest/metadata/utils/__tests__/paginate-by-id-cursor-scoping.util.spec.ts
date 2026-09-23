import { type SelectQueryBuilder } from 'typeorm';

import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { paginateByIdCursor } from 'src/engine/api/rest/metadata/utils/paginate-by-id-cursor.util';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type ScopedRow = { id: string; workspaceId: string };

const WORKSPACE_ID = '00000000-0000-4000-8000-000000000001';

const buildQueryBuilder = () => {
  const queryBuilder: Record<string, jest.Mock> = {
    andWhere: jest.fn(),
    orderBy: jest.fn(),
    take: jest.fn(),
    clone: jest.fn(),
    getMany: jest.fn().mockResolvedValue([]),
    getCount: jest.fn().mockResolvedValue(0),
  };

  for (const chainedMethod of ['andWhere', 'orderBy', 'take', 'clone']) {
    queryBuilder[chainedMethod].mockReturnValue(queryBuilder);
  }

  return queryBuilder as unknown as SelectQueryBuilder<ScopedRow> & {
    andWhere: jest.Mock;
  };
};

describe('paginateByIdCursor workspace scoping', () => {
  const request = { query: {} } as unknown as AuthenticatedRequest;

  it('builds the query through the scoped builder rather than the escape hatch', async () => {
    const queryBuilder = buildQueryBuilder();
    const createScopedQueryBuilder = jest.fn(() => queryBuilder);
    const createQueryBuilder = jest.fn(() => queryBuilder);

    await paginateByIdCursor<ScopedRow>({
      repository: {
        createScopedQueryBuilder,
        createQueryBuilder,
      } as unknown as WorkspaceScopedRepository<ScopedRow>,
      workspaceId: WORKSPACE_ID,
      request,
    });

    expect(createScopedQueryBuilder).toHaveBeenCalledWith(
      WORKSPACE_ID,
      'metadata',
    );
    expect(createQueryBuilder).not.toHaveBeenCalled();
  });

  it('adds caller criteria on top of the workspace predicate instead of replacing it', async () => {
    const queryBuilder = buildQueryBuilder();
    const createScopedQueryBuilder = jest.fn(() => queryBuilder);

    await paginateByIdCursor<ScopedRow>({
      repository: {
        createScopedQueryBuilder,
      } as unknown as WorkspaceScopedRepository<ScopedRow>,
      workspaceId: WORKSPACE_ID,
      where: { id: '00000000-0000-4000-8000-00000000000a' },
      request,
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith({
      id: '00000000-0000-4000-8000-00000000000a',
    });
  });
});
