import { sortCachedObjectEdges } from '@/apollo/optimistic-effect/utils/sortCachedObjectEdges';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';

describe('sortCachedObjectEdges', () => {
  const createMockReadField = () => {
    return ((fieldName: string, from?: any) => {
      if (!from) return null;
      return from[fieldName] ?? null;
    }) as any;
  };

  it('should sort by single criterion ascending', () => {
    const edges: RecordGqlRefEdge[] = [
      { cursor: '1', node: { id: '1', score: 20 } as any },
      { cursor: '2', node: { id: '2', score: 10 } as any },
      { cursor: '3', node: { id: '3', score: 30 } as any },
    ];
    const orderBy: RecordGqlOperationOrderBy = [{ score: 'AscNullsLast' }];

    const result = sortCachedObjectEdges({
      edges,
      orderBy,
      readCacheField: createMockReadField(),
    });

    expect(result.map((e) => (e.node as any).score)).toEqual([10, 20, 30]);
  });

  it('should resolve ties on first criterion using secondary orderBy field', () => {
    const edges: RecordGqlRefEdge[] = [
      { cursor: '1', node: { id: '1', score: 10, rank: 2 } as any },
      { cursor: '2', node: { id: '2', score: 10, rank: 1 } as any },
      { cursor: '3', node: { id: '3', score: 5, rank: 9 } as any },
    ];
    const orderBy: RecordGqlOperationOrderBy = [
      { score: 'AscNullsLast' },
      { rank: 'AscNullsLast' },
    ];

    const result = sortCachedObjectEdges({
      edges,
      orderBy,
      readCacheField: createMockReadField(),
    });

    expect(result.map((e) => (e.node as any).id)).toEqual(['3', '2', '1']);
  });

  it('should resolve ties on null values on first field using secondary field', () => {
    const edges: RecordGqlRefEdge[] = [
      { cursor: '1', node: { id: '1', score: null, rank: 20 } as any },
      { cursor: '2', node: { id: '2', score: null, rank: 10 } as any },
      { cursor: '3', node: { id: '3', score: 5, rank: 99 } as any },
    ];
    const orderBy: RecordGqlOperationOrderBy = [
      { score: 'AscNullsLast' },
      { rank: 'AscNullsLast' },
    ];

    const result = sortCachedObjectEdges({
      edges,
      orderBy,
      readCacheField: createMockReadField(),
    });

    expect(result.map((e) => (e.node as any).id)).toEqual(['3', '2', '1']);
  });

  it('should support mixed sort directions across multiple criteria', () => {
    const edges: RecordGqlRefEdge[] = [
      { cursor: '1', node: { id: '1', category: 'A', priority: 1 } as any },
      { cursor: '2', node: { id: '2', category: 'A', priority: 5 } as any },
      { cursor: '3', node: { id: '3', category: 'B', priority: 2 } as any },
    ];
    const orderBy: RecordGqlOperationOrderBy = [
      { category: 'AscNullsLast' },
      { priority: 'DescNullsLast' },
    ];

    const result = sortCachedObjectEdges({
      edges,
      orderBy,
      readCacheField: createMockReadField(),
    });

    expect(result.map((e) => (e.node as any).id)).toEqual(['2', '1', '3']);
  });

  it('should support nested relation fields in secondary orderBy', () => {
    const edges: RecordGqlRefEdge[] = [
      {
        cursor: '1',
        node: {
          id: '1',
          category: 'A',
          company: { name: 'Zeta' },
        } as any,
      },
      {
        cursor: '2',
        node: {
          id: '2',
          category: 'A',
          company: { name: 'Alpha' },
        } as any,
      },
    ];
    const orderBy: RecordGqlOperationOrderBy = [
      { category: 'AscNullsLast' },
      { company: { name: 'AscNullsLast' } },
    ];

    const result = sortCachedObjectEdges({
      edges,
      orderBy,
      readCacheField: createMockReadField(),
    });

    expect(result.map((e) => (e.node as any).id)).toEqual(['2', '1']);
  });

  it('should return original edges if orderBy is empty or has no valid criteria', () => {
    const edges: RecordGqlRefEdge[] = [
      { cursor: '1', node: { id: '1', score: 20 } as any },
      { cursor: '2', node: { id: '2', score: 10 } as any },
    ];

    const result = sortCachedObjectEdges({
      edges,
      orderBy: [] as any,
      readCacheField: createMockReadField(),
    });

    expect(result).toBe(edges);
  });
});
