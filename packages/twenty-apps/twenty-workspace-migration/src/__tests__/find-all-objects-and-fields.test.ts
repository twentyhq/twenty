import { describe, expect, it } from 'vitest';
import { type AxiosInstance } from 'axios';
import { FindAllObjectsAndFields } from 'src/logic-functions/requests/find-all-objects-and-fields.util';

type Page = {
  edges: { node: { nameSingular: string } }[];
  pageInfo: { endCursor: string | null; hasNextPage: boolean };
};

// The shared mock returns one fixed payload per operation, which can't express a cursor walk.
const createPagingClient = (pages: Page[]) => {
  const queries: string[] = [];
  let pageIndex = 0;

  const post = async (_path: string, body: { query: string }) => {
    queries.push(body.query);
    const page = pages[pageIndex];
    pageIndex += 1;
    return { data: { data: { objects: page } } };
  };

  return { client: { post } as unknown as AxiosInstance, queries };
};

describe('FindAllObjectsAndFields', () => {
  it('returns a single page unchanged and asks for no cursor', async () => {
    const { client, queries } = createPagingClient([
      {
        edges: [{ node: { nameSingular: 'company' } }],
        pageInfo: { endCursor: 'cursor-1', hasNextPage: false },
      },
    ]);

    const result = await FindAllObjectsAndFields(client);

    expect(result.data.objects.edges).toHaveLength(1);
    expect(queries).toHaveLength(1);
    expect(queries[0]).not.toContain('after:');
  });

  it('follows the cursor and concatenates every page in order', async () => {
    const { client, queries } = createPagingClient([
      {
        edges: [{ node: { nameSingular: 'company' } }],
        pageInfo: { endCursor: 'cursor-1', hasNextPage: true },
      },
      {
        edges: [{ node: { nameSingular: 'person' } }],
        pageInfo: { endCursor: 'cursor-2', hasNextPage: true },
      },
      {
        edges: [{ node: { nameSingular: 'opportunity' } }],
        pageInfo: { endCursor: 'cursor-3', hasNextPage: false },
      },
    ]);

    const result = await FindAllObjectsAndFields(client);

    expect(result.data.objects.edges.map((edge) => edge.node.nameSingular)).toEqual([
      'company',
      'person',
      'opportunity',
    ]);
    expect(queries).toHaveLength(3);
    expect(queries[1]).toContain('after: "cursor-1"');
    expect(queries[2]).toContain('after: "cursor-2"');
  });

  it('stops when the server reports another page but hands back no cursor', async () => {
    const { client, queries } = createPagingClient([
      {
        edges: [{ node: { nameSingular: 'company' } }],
        pageInfo: { endCursor: null, hasNextPage: true },
      },
    ]);

    const result = await FindAllObjectsAndFields(client);

    expect(result.data.objects.edges).toHaveLength(1);
    expect(queries).toHaveLength(1);
  });
});
