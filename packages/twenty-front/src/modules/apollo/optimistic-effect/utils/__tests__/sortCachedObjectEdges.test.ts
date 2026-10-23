import { gql, InMemoryCache } from '@apollo/client';

import { sortCachedObjectEdges } from '@/apollo/optimistic-effect/utils/sortCachedObjectEdges';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';

const RECORDS_QUERY = gql`
  query Records {
    records {
      edges {
        cursor
        node {
          id
          score
          rank
          name {
            firstName
            lastName
          }
          owner {
            id
            name {
              firstName
              lastName
            }
          }
        }
      }
    }
  }
`;

type TestRecord = {
  id: string;
  score?: number | null;
  rank?: number | null;
  name?: { firstName: string; lastName: string } | null;
  owner?: {
    id: string;
    name: { firstName: string; lastName: string } | null;
  } | null;
};

const sortRecords = (
  records: TestRecord[],
  orderBy: RecordGqlOperationOrderBy,
) => {
  const cache = new InMemoryCache();
  cache.writeQuery({
    query: RECORDS_QUERY,
    data: {
      records: {
        edges: records.map((record) => ({
          cursor: record.id,
          node: {
            __typename: 'Record',
            score: null,
            rank: null,
            name: null,
            owner: null,
            ...record,
            ...(record.owner && {
              owner: { __typename: 'Owner', ...record.owner },
            }),
          },
        })),
      },
    },
  });

  cache.modify<{ records: { edges: RecordGqlRefEdge[] } }>({
    fields: {
      records: (connection, { readField }) => {
        const edges = [
          ...(readField<RecordGqlRefEdge[]>('edges', connection) ?? []),
        ];
        const originalEdges = [...edges];
        const sortedEdges = sortCachedObjectEdges({
          edges,
          orderBy,
          readCacheField: readField,
        });
        expect(edges).toEqual(originalEdges);
        return { ...connection, edges: sortedEdges };
      },
    },
  });

  return cache
    .readQuery<{ records: { edges: { node: { id: string } }[] } }>({
      query: RECORDS_QUERY,
    })!
    .records.edges.map(({ node }) => node.id);
};

describe('sortCachedObjectEdges', () => {
  it('uses the second sort when the first values are equal', () => {
    expect(
      sortRecords(
        [
          { id: 'later', score: 10, rank: 2 },
          { id: 'first', score: 10, rank: 1 },
        ],
        [{ score: 'AscNullsLast' }, { rank: 'AscNullsLast' }],
      ),
    ).toEqual(['first', 'later']);
  });

  it('keeps earlier sorts ahead of later sorts with mixed directions', () => {
    expect(
      sortRecords(
        [
          { id: 'low', score: 1, rank: 0 },
          { id: 'last', score: 2, rank: 2 },
          { id: 'first', score: 2, rank: 1 },
        ],
        [{ score: 'DescNullsLast' }, { rank: 'AscNullsLast' }],
      ),
    ).toEqual(['first', 'last', 'low']);
  });

  it('uses the third sort to break a tie on the first two', () => {
    expect(
      sortRecords(
        [
          { id: 'a', score: 10, rank: 1 },
          { id: 'b', score: 10, rank: 1 },
        ],
        [
          { score: 'AscNullsLast' },
          { rank: 'AscNullsLast' },
          { id: 'DescNullsLast' },
        ],
      ),
    ).toEqual(['b', 'a']);
  });

  it.each([
    'AscNullsFirst',
    'DescNullsFirst',
    'AscNullsLast',
    'DescNullsLast',
  ] as const)(
    'continues to the next field when both values are null (%s)',
    (direction) => {
      const nullIds = ['null-first', 'null-last'];
      expect(
        sortRecords(
          [
            { id: 'null-last', score: null, rank: 2 },
            { id: 'value', score: 10, rank: 0 },
            { id: 'null-first', rank: 1 },
          ],
          [{ score: direction }, { rank: 'AscNullsLast' }],
        ),
      ).toEqual(
        direction.endsWith('NullsFirst')
          ? [...nullIds, 'value']
          : ['value', ...nullIds],
      );
    },
  );

  it('applies null placement and descending order to the second field', () => {
    expect(
      sortRecords(
        [
          { id: 'one', score: 10, rank: 1 },
          { id: 'null', score: 10 },
          { id: 'two', score: 10, rank: 2 },
        ],
        [{ score: 'AscNullsLast' }, { rank: 'DescNullsFirst' }],
      ),
    ).toEqual(['null', 'two', 'one']);
  });

  it('reads composite fields as subsequent sort criteria', () => {
    expect(
      sortRecords(
        [
          { id: 'bob', score: 10, name: { firstName: 'Bob', lastName: 'A' } },
          {
            id: 'alice',
            score: 10,
            name: { firstName: 'Alice', lastName: 'Z' },
          },
        ],
        [{ score: 'AscNullsLast' }, { name: { firstName: 'AscNullsLast' } }],
      ),
    ).toEqual(['alice', 'bob']);
  });

  it('reads composite fields through normalized relation references', () => {
    expect(
      sortRecords(
        [
          {
            id: 'bob',
            score: 10,
            owner: { id: 'owner-b', name: { firstName: 'Bob', lastName: 'A' } },
          },
          {
            id: 'alice',
            score: 10,
            owner: {
              id: 'owner-a',
              name: { firstName: 'Alice', lastName: 'Z' },
            },
          },
          { id: 'missing', score: 10 },
        ],
        [
          { score: 'AscNullsLast' },
          { owner: { name: { firstName: 'AscNullsLast' } } },
        ],
      ),
    ).toEqual(['alice', 'bob', 'missing']);
  });

  it('honors multiple fields within the same orderBy object', () => {
    expect(
      sortRecords(
        [
          { id: 'later', score: 10, rank: 2 },
          { id: 'first', score: 10, rank: 1 },
        ],
        [{ score: 'AscNullsLast', rank: 'AscNullsLast' }],
      ),
    ).toEqual(['first', 'later']);
  });

  it('honors multiple subfields within the same composite criterion', () => {
    expect(
      sortRecords(
        [
          { id: 'z', name: { firstName: 'Alice', lastName: 'Z' } },
          { id: 'a', name: { firstName: 'Alice', lastName: 'A' } },
        ],
        [{ name: { firstName: 'AscNullsLast', lastName: 'AscNullsLast' } }],
      ),
    ).toEqual(['a', 'z']);
  });

  it('preserves input order when every sort criterion ties', () => {
    expect(
      sortRecords(
        [
          { id: 'b', score: 0, rank: 1 },
          { id: 'a', score: 0, rank: 1 },
        ],
        [{ score: 'AscNullsLast' }, { rank: 'AscNullsLast' }],
      ),
    ).toEqual(['b', 'a']);
  });

  it('preserves existing case-insensitive string comparison', () => {
    expect(
      sortRecords(
        [
          { id: 'b', name: { firstName: 'ALICE', lastName: 'Z' }, rank: 2 },
          { id: 'a', name: { firstName: 'alice', lastName: 'A' }, rank: 1 },
        ],
        [{ name: { firstName: 'AscNullsLast' } }, { rank: 'AscNullsLast' }],
      ),
    ).toEqual(['a', 'b']);
  });

  it('preserves input order when no sort is requested', () => {
    expect(sortRecords([{ id: 'b' }, { id: 'a' }], [])).toEqual(['b', 'a']);
  });

  it('handles an empty connection', () => {
    expect(sortRecords([], [{ score: 'AscNullsLast' }])).toEqual([]);
  });
});
