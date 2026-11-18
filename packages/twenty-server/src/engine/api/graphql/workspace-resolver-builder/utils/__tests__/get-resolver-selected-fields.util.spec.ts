import { Kind, parse, type FragmentDefinitionNode } from 'graphql';

import { computeSelectionKey } from 'src/engine/api/graphql/workspace-resolver-builder/utils/compute-selection-key.util';
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

const FIRST_PERSON_KEY = computeSelectionKey({
  fieldName: 'people',
  arguments: { first: 1 },
});

describe('getResolverSelectedFields', () => {
  it('keys a relation with arguments by field name and arguments', () => {
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
      [computeSelectionKey({
        fieldName: 'people',
        arguments: { orderBy: [{ name: 'AscNullsLast' }], first: 1 },
      })]: {
        __arguments: { first: 1, orderBy: [{ name: 'AscNullsLast' }] },
        edges: { node: { id: {} } },
      },
    });
  });

  it('resolves variables in arguments', () => {
    const filter = { city: { eq: 'Paris' } };

    expect(
      getSelectedFields(
        `query ($filter: PersonFilterInput) {
          companies { edges { node { people(filter: $filter) { totalCount } } } }
        }`,
        { filter },
      ).edges.node[
        computeSelectionKey({ fieldName: 'people', arguments: { filter } })
      ].__arguments,
    ).toEqual({ filter });
  });

  it('loads aliases of one relation with different arguments separately', () => {
    expect(
      getSelectedFields(`
        query {
          companies {
            edges {
              node {
                name: people { totalCount }
                firstPerson: people(first: 1) { totalCount }
                twoPeople: people(first: 2) { edges { node { id } } }
              }
            }
          }
        }
      `).edges.node,
    ).toEqual({
      people: { totalCount: {} },
      [FIRST_PERSON_KEY]: { __arguments: { first: 1 }, totalCount: {} },
      [computeSelectionKey({ fieldName: 'people', arguments: { first: 2 } })]: {
        __arguments: { first: 2 },
        edges: { node: { id: {} } },
      },
    });
  });

  it('loads aliases of one relation with the same arguments once', () => {
    expect(
      getSelectedFields(`
        query {
          companies {
            first: edges {
              node {
                firstPerson: people(first: 1) { totalCount }
              }
            }
            second: edges {
              node {
                samePerson: people(first: 1) { edges { node { id } } }
              }
            }
          }
        }
      `).edges.node,
    ).toEqual({
      [FIRST_PERSON_KEY]: {
        __arguments: { first: 1 },
        totalCount: {},
        edges: { node: { id: {} } },
      },
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

  it('keeps response keys out of the plan', () => {
    const selectedFields = getSelectedFields(`
      query {
        companies {
          edges {
            node {
              __proto__: people(first: 1) { kind: __typename }
              __arguments: name
            }
          }
        }
      }
    `).edges.node;

    expect(Object.keys(selectedFields)).toEqual([FIRST_PERSON_KEY, 'name']);
    expect(selectedFields[FIRST_PERSON_KEY]).toEqual({
      __arguments: { first: 1 },
      __typename: {},
    });
  });

  it.each(['__proto__', '__arguments', '__schema'])(
    'rejects a field named %s',
    (fieldName) => {
      expect(() =>
        getSelectedFields(`
          query { companies { edges { node { ${fieldName} { id } } } } }
        `),
      ).toThrow(`Cannot query field "${fieldName}"`);
    },
  );
});
