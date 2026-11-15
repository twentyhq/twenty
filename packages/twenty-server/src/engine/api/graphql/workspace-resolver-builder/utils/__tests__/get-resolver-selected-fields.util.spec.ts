import { Kind, parse, type FragmentDefinitionNode } from 'graphql';

import { getResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-resolver-selected-fields.util';

const getSelectedFields = (
  query: string,
  variableValues: Record<string, unknown> = {},
) => {
  const document = parse(query);
  const [operation, ...fragments] = document.definitions;

  if (operation.kind !== Kind.OPERATION_DEFINITION) {
    throw new Error('Expected an operation first');
  }

  const [rootField] = operation.selectionSet.selections;

  if (rootField.kind !== Kind.FIELD) {
    throw new Error('Expected a root field');
  }

  return getResolverSelectedFields({
    fieldNodes: [rootField],
    fragments: Object.fromEntries(
      (fragments as FragmentDefinitionNode[]).map((fragment) => [
        fragment.name.value,
        fragment,
      ]),
    ),
    variableValues,
  });
};

describe('getResolverSelectedFields', () => {
  it('keeps the arguments of a relation next to its selection', () => {
    expect(
      getSelectedFields(`
        query {
          companies {
            edges {
              node {
                people(first: 1, orderBy: [{ name: AscNullsLast }]) {
                  edges { node { id } }
                }
              }
            }
          }
        }
      `).edges.node,
    ).toEqual({
      people: {
        __arguments: { first: 1, orderBy: [{ name: 'AscNullsLast' }] },
        edges: { node: { id: {} } },
      },
    });
  });

  it('resolves variables in arguments', () => {
    expect(
      getSelectedFields(
        `query ($filter: PersonFilterInput) {
          companies { edges { node { people(filter: $filter) { totalCount } } } }
        }`,
        { filter: { city: { eq: 'Paris' } } },
      ).edges.node.people.__arguments,
    ).toEqual({ filter: { city: { eq: 'Paris' } } });
  });

  it('rejects aliases of one relation with different arguments', () => {
    expect(() =>
      getSelectedFields(`
        query {
          companies {
            edges {
              node {
                firstPerson: people(first: 1) { totalCount }
                twoPeople: people(first: 2) { totalCount }
              }
            }
          }
        }
      `),
    ).toThrow('Conflicting arguments for "people"');
  });

  it('accepts aliases of one relation with the same arguments', () => {
    expect(
      getSelectedFields(`
        query {
          companies {
            edges {
              node {
                firstPerson: people(first: 1) { totalCount }
                samePerson: people(first: 1) { edges { node { id } } }
              }
            }
          }
        }
      `).edges.node.people,
    ).toEqual({
      __arguments: { first: 1 },
      totalCount: {},
      edges: { node: { id: {} } },
    });
  });

  it('merges fragments and inline fragments and honours skip and include', () => {
    expect(
      getSelectedFields(
        `query ($withName: Boolean!) {
          companies {
            edges {
              node {
                ...CompanyFields
                ... on Company { domainName { primaryLinkUrl } }
                name @include(if: $withName)
                employees @skip(if: true)
              }
            }
          }
        }
        fragment CompanyFields on Company { id }`,
        { withName: false },
      ).edges.node,
    ).toEqual({ id: {}, domainName: { primaryLinkUrl: {} } });
  });

  it('keeps a field named __proto__ as an ordinary key', () => {
    const selectedFields = getSelectedFields(`
      query {
        companies {
          edges {
            node {
              __proto__(first: 1) { id }
            }
          }
        }
      }
    `).edges.node;

    expect(
      Object.prototype.hasOwnProperty.call(selectedFields, '__proto__'),
    ).toBe(true);
    expect(selectedFields['__proto__']).toEqual({
      __arguments: { first: 1 },
      id: {},
    });
    expect(
      Object.prototype.hasOwnProperty.call(Object.prototype, '__arguments'),
    ).toBe(false);
  });
});
