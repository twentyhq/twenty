import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { paginateMetadataRestItemsById } from 'src/engine/api/rest/metadata/utils/paginate-metadata-rest-items-by-id.util';

const UUID_A = '00000000-0000-4000-8000-00000000000a';
const UUID_B = '00000000-0000-4000-8000-00000000000b';
const UUID_C = '00000000-0000-4000-8000-00000000000c';

const requestWithQuery = (
  query: Record<string, string>,
): AuthenticatedRequest => ({ query }) as unknown as AuthenticatedRequest;

describe('paginateMetadataRestItemsById', () => {
  const items = [{ id: UUID_A }, { id: UUID_C }, { id: UUID_B }];

  it('orders by id descending regardless of input order', () => {
    expect(
      paginateMetadataRestItemsById({ items, request: requestWithQuery({}) }),
    ).toEqual({
      data: [{ id: UUID_C }, { id: UUID_B }, { id: UUID_A }],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: UUID_C,
        endCursor: UUID_A,
      },
      totalCount: 3,
    });
  });

  it('pages forward after a cursor and keeps the full count', () => {
    expect(
      paginateMetadataRestItemsById({
        items,
        request: requestWithQuery({ limit: '1', starting_after: UUID_C }),
      }),
    ).toEqual({
      data: [{ id: UUID_B }],
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: true,
        startCursor: UUID_B,
        endCursor: UUID_B,
      },
      totalCount: 3,
    });
  });

  it('pages backward before a cursor in any casing', () => {
    const page = paginateMetadataRestItemsById({
      items,
      request: requestWithQuery({
        limit: '1',
        ending_before: UUID_A.toUpperCase(),
      }),
    });

    expect(page.data).toEqual([{ id: UUID_B }]);
    expect(page.pageInfo.hasPreviousPage).toBe(true);
    expect(page.pageInfo.hasNextPage).toBe(true);
  });
});
