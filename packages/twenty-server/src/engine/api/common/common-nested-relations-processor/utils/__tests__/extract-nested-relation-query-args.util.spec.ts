import { extractNestedRelationQueryArgs } from 'src/engine/api/common/common-nested-relations-processor/utils/extract-nested-relation-query-args.util';

describe('extractNestedRelationQueryArgs', () => {
  it('returns no arguments when the field has none', () => {
    expect(extractNestedRelationQueryArgs({})).toEqual({});
  });

  it('extracts filter, orderBy and first', () => {
    expect(
      extractNestedRelationQueryArgs({
        filter: { status: { eq: 'OPEN' } },
        orderBy: [{ dueAt: 'AscNullsLast' }],
        first: 1,
      }),
    ).toEqual({
      filter: { status: { eq: 'OPEN' } },
      orderBy: [{ dueAt: 'AscNullsLast' }],
      first: 1,
    });
  });

  it('wraps a single orderBy object in a list', () => {
    expect(
      extractNestedRelationQueryArgs({ orderBy: { dueAt: 'DescNullsLast' } }),
    ).toEqual({ orderBy: [{ dueAt: 'DescNullsLast' }] });
  });

  it('accepts first: 0', () => {
    expect(extractNestedRelationQueryArgs({ first: 0 })).toEqual({ first: 0 });
  });

  it('treats null arguments as unset', () => {
    expect(
      extractNestedRelationQueryArgs({
        filter: null,
        orderBy: null,
        first: null,
      }),
    ).toEqual({});
  });

  it('ignores cursor, offset and unset arguments', () => {
    expect(
      extractNestedRelationQueryArgs({
        after: 'cursor',
        before: 'cursor',
        last: 2,
        offset: 1,
        filter: undefined,
      }),
    ).toEqual({});
  });

  it.each([
    ['a list filter', { filter: [] }],
    ['a string filter', { filter: 'x' }],
    ['a string orderBy', { orderBy: 'name' }],
    ['a string first', { first: '5' }],
    ['a negative first', { first: -1 }],
    ['a fractional first', { first: 2.5 }],
    ['an unknown argument', { limit: 5 }],
  ])('rejects %s', (_, graphqlArguments) => {
    expect(() => extractNestedRelationQueryArgs(graphqlArguments)).toThrow(
      expect.objectContaining({ code: 'INVALID_QUERY_INPUT' }),
    );
  });
});
