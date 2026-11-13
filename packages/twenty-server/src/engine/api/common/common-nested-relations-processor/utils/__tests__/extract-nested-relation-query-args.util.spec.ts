import { extractNestedRelationQueryArgs } from 'src/engine/api/common/common-nested-relations-processor/utils/extract-nested-relation-query-args.util';

describe('extractNestedRelationQueryArgs', () => {
  it('returns no arguments when the field has none', () => {
    expect(extractNestedRelationQueryArgs(undefined)).toEqual({});
  });

  it('extracts filter, orderBy and first', () => {
    expect(
      extractNestedRelationQueryArgs([
        {
          filter: {
            kind: 'ObjectValue',
            value: { status: { eq: 'OPEN' } },
          },
        },
        {
          orderBy: {
            kind: 'ListValue',
            value: [{ dueAt: 'AscNullsLast' }],
          },
        },
        { first: { kind: 'IntValue', value: 1 } },
      ]),
    ).toEqual({
      filter: { status: { eq: 'OPEN' } },
      orderBy: [{ dueAt: 'AscNullsLast' }],
      first: 1,
    });
  });

  it('wraps a single orderBy object in a list', () => {
    expect(
      extractNestedRelationQueryArgs([
        {
          orderBy: {
            kind: 'ObjectValue',
            value: { dueAt: 'DescNullsLast' },
          },
        },
      ]),
    ).toEqual({ orderBy: [{ dueAt: 'DescNullsLast' }] });
  });

  it('ignores an argument bound to an unset variable', () => {
    expect(
      extractNestedRelationQueryArgs([
        { filter: { kind: 'Variable', value: undefined } },
      ]),
    ).toEqual({});
  });

  it.each([
    [{ offset: { kind: 'IntValue', value: 1 } }],
    [{ after: { kind: 'StringValue', value: 'cursor' } }],
    [{ first: { kind: 'IntValue', value: 0 } }],
  ])('rejects an argument it cannot apply: %j', (graphqlArgument) => {
    expect(() => extractNestedRelationQueryArgs([graphqlArgument])).toThrow(
      'is not supported on a nested relation',
    );
  });
});
