import { computeSelectionKey } from 'src/engine/api/graphql/workspace-resolver-builder/utils/compute-selection-key.util';

describe('computeSelectionKey', () => {
  it('returns the field name for a field without arguments', () => {
    expect(computeSelectionKey({ fieldName: 'people', arguments: {} })).toBe(
      'people',
    );
  });

  it('appends a hash of the arguments to the field name', () => {
    expect(
      computeSelectionKey({ fieldName: 'people', arguments: { first: 1 } }),
    ).toMatch(/^people:[0-9a-f]{16}$/);
  });

  it('ignores the order of argument keys at every depth', () => {
    const argumentsWithoutPrototype = Object.assign(Object.create(null), {
      orderBy: [{ name: 'AscNullsLast' }],
      filter: { and: [{ city: { eq: 'Paris' } }], id: { neq: 'id' } },
    });

    expect(
      computeSelectionKey({
        fieldName: 'people',
        arguments: argumentsWithoutPrototype,
      }),
    ).toBe(
      computeSelectionKey({
        fieldName: 'people',
        arguments: {
          filter: { id: { neq: 'id' }, and: [{ city: { eq: 'Paris' } }] },
          orderBy: [{ name: 'AscNullsLast' }],
        },
      }),
    );
  });

  it('distinguishes different arguments', () => {
    expect(
      computeSelectionKey({ fieldName: 'people', arguments: { first: 1 } }),
    ).not.toBe(
      computeSelectionKey({ fieldName: 'people', arguments: { first: 2 } }),
    );
  });
});
