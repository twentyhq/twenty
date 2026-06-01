import { pruneFilterToAllowedKeys } from 'src/engine/core-modules/record-crud/utils/prune-filter-to-allowed-keys.util';

const allowed = new Set(['id', 'name', 'employees', 'and', 'or', 'not']);

describe('pruneFilterToAllowedKeys', () => {
  it('keeps valid field filters untouched', () => {
    const { filter, droppedKeys } = pruneFilterToAllowedKeys(
      { name: { firstName: { ilike: '%ada%' } } },
      allowed,
    );

    expect(filter).toEqual({ name: { firstName: { ilike: '%ada%' } } });
    expect(droppedKeys).toEqual([]);
  });

  it('drops bare operators placed at the filter root (the gh#76 fault)', () => {
    const { filter, droppedKeys } = pruneFilterToAllowedKeys(
      { ilike: 'Foreman' },
      allowed,
    );

    expect(filter).toEqual({});
    expect(droppedKeys).toEqual(['ilike']);
  });

  it('drops invalid keys but preserves valid sibling fields', () => {
    const { filter, droppedKeys } = pruneFilterToAllowedKeys(
      { eq: 'x', name: { eq: 'Ada' } },
      allowed,
    );

    expect(filter).toEqual({ name: { eq: 'Ada' } });
    expect(droppedKeys).toEqual(['eq']);
  });

  it('recurses into and/or arrays and the not object', () => {
    const { filter, droppedKeys } = pruneFilterToAllowedKeys(
      {
        and: [{ name: { eq: 'Ada' } }, { ilike: 'oops' }],
        or: [{ employees: { gt: 5 } }],
        not: { bogus: 1, id: { eq: 'abc' } },
      },
      allowed,
    );

    expect(filter).toEqual({
      and: [{ name: { eq: 'Ada' } }, {}],
      or: [{ employees: { gt: 5 } }],
      not: { id: { eq: 'abc' } },
    });
    expect(droppedKeys.sort()).toEqual(['bogus', 'ilike']);
  });

  it('returns an empty object for non-object input', () => {
    expect(pruneFilterToAllowedKeys(undefined, allowed).filter).toEqual({});
    expect(pruneFilterToAllowedKeys('nope', allowed).filter).toEqual({});
  });
});
