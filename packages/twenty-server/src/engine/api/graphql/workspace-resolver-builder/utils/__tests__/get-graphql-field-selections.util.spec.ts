import { Kind, parse, type FragmentDefinitionNode } from 'graphql';

import { getGraphqlFieldSelections } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-graphql-field-selections.util';

const getNodeSelections = ({
  query,
  variableValues = {},
}: {
  query: string;
  variableValues?: Record<string, unknown>;
}) => {
  const document = parse(query);
  const [operation, ...fragments] = document.definitions;

  if (operation.kind !== Kind.OPERATION_DEFINITION) {
    throw new Error('Expected an operation first');
  }

  const [rootField] = operation.selectionSet.selections;

  if (rootField.kind !== Kind.FIELD) {
    throw new Error('Expected a root field');
  }

  const [edges] = getGraphqlFieldSelections({
    fieldNodes: [rootField],
    fragments: Object.fromEntries(
      fragments
        .filter(
          (definition): definition is FragmentDefinitionNode =>
            definition.kind === Kind.FRAGMENT_DEFINITION,
        )
        .map((fragment) => [fragment.name.value, fragment]),
    ),
    variableValues,
  });

  return edges.selections[0].selections;
};

describe('getGraphqlFieldSelections', () => {
  it('keeps each alias as its own selection with its field name and arguments', () => {
    expect(
      getNodeSelections({
        query: `
        query {
          companies {
            edges {
              node {
                label: name
                firstPerson: people(first: 1) { totalCount }
                people { totalCount }
              }
            }
          }
        }
      `,
      }),
    ).toEqual([
      {
        responseKey: 'label',
        fieldName: 'name',
        arguments: {},
        selections: [],
      },
      {
        responseKey: 'firstPerson',
        fieldName: 'people',
        arguments: { first: 1 },
        selections: [
          {
            responseKey: 'totalCount',
            fieldName: 'totalCount',
            arguments: {},
            selections: [],
          },
        ],
      },
      {
        responseKey: 'people',
        fieldName: 'people',
        arguments: {},
        selections: [
          {
            responseKey: 'totalCount',
            fieldName: 'totalCount',
            arguments: {},
            selections: [],
          },
        ],
      },
    ]);
  });

  it('merges selections sharing a response key across fragments', () => {
    const [scoped] = getNodeSelections({
      query: `
      query {
        companies {
          edges {
            node {
              scoped: people(first: 1) { totalCount }
              ...CompanyPeople
            }
          }
        }
      }

      fragment CompanyPeople on Company {
        scoped: people(first: 1) { edges { node { id } } }
      }
    `,
    });

    expect(scoped.responseKey).toBe('scoped');
    expect(scoped.selections.map(({ responseKey }) => responseKey)).toEqual([
      'totalCount',
      'edges',
    ]);
  });

  it.each([
    ['another field', 'label: name label: id'],
    [
      'other arguments',
      'scoped: people(first: 1) { totalCount } scoped: people(first: 2) { totalCount }',
    ],
  ])('rejects a response key that names %s', (_, conflictingFields) => {
    expect(() =>
      getNodeSelections({
        query: `query { companies { edges { node { ${conflictingFields} } } } }`,
      }),
    ).toThrow(/^Fields "(label|scoped)" conflict/);
  });

  it('rejects a spread of an unknown fragment', () => {
    expect(() =>
      getNodeSelections({
        query: 'query { companies { edges { node { ...missingFields } } } }',
      }),
    ).toThrow('Unknown fragment "missingFields"');
  });

  it('honours skip and include', () => {
    expect(
      getNodeSelections({
        query: `query ($withName: Boolean!) {
          companies { edges { node { id name @include(if: $withName) } } }
        }`,
        variableValues: { withName: false },
      }).map(({ responseKey }) => responseKey),
    ).toEqual(['id']);
  });
});
