import { Kind, parse } from 'graphql';

import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { getResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-resolver-selected-fields.util';
import { getSelectionEntries } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-selection-entries.util';
import { mergeFieldSelections } from 'src/engine/api/graphql/workspace-resolver-builder/utils/merge-field-selections.util';

const getSelectedFields = (query: string) => {
  const [operation] = parse(query).definitions;

  if (operation.kind !== Kind.OPERATION_DEFINITION) {
    throw new Error('Expected an operation');
  }

  const [rootField] = operation.selectionSet.selections;

  if (rootField.kind !== Kind.FIELD) {
    throw new Error('Expected a root field');
  }

  return getResolverSelectedFields({
    fieldNodes: [rootField],
    fragments: {},
    variableValues: {},
  });
};

describe('mergeFieldSelections', () => {
  it('keeps the nested selections of every alias of a field', () => {
    const selectedFields = getSelectedFields(`
      query {
        companies {
          withName: edges { node { name } }
          withDomain: edges { node { domainName } }
        }
      }
    `);

    const edges = mergeFieldSelections({ selectedFields, fieldName: 'edges' });

    expect(Object.keys(edges.node)).toEqual(['name', 'domainName']);
  });

  it('keeps every field when separate aliases reuse a response key for different fields', () => {
    const selectedFields = getSelectedFields(`
      query {
        companies {
          a: edges { node { x: name } }
          b: edges { node { x: employees } }
        }
      }
    `);

    const node = mergeFieldSelections({
      selectedFields: mergeFieldSelections({
        selectedFields,
        fieldName: 'edges',
      }),
      fieldName: 'node',
    });

    expect(
      getSelectionEntries(node).map(({ responseKey, fieldName }) => ({
        responseKey,
        fieldName,
      })),
    ).toEqual([
      { responseKey: 'x', fieldName: 'name' },
      { responseKey: 'x', fieldName: 'employees' },
    ]);
  });

  it('merges a relation reused under separate aliases with the same arguments', () => {
    const selectedFields = getSelectedFields(`
      query {
        companies {
          a: edges { node { x: people(first: 1) { edges { node { id } } } } }
          b: edges { node { x: people(first: 1) { totalCount } } }
        }
      }
    `);

    const node = mergeFieldSelections({
      selectedFields: mergeFieldSelections({
        selectedFields,
        fieldName: 'edges',
      }),
      fieldName: 'node',
    });

    expect(getSelectionEntries(node)).toEqual([
      {
        responseKey: 'x',
        fieldName: 'people',
        selection: expect.objectContaining({
          edges: expect.anything(),
          totalCount: expect.anything(),
        }),
      },
    ]);
  });

  it('rejects a relation reused under separate aliases with other arguments', () => {
    const selectedFields = getSelectedFields(`
      query {
        companies {
          a: edges { node { x: people(first: 1) { totalCount } } }
          b: edges { node { x: people(first: 2) { totalCount } } }
        }
      }
    `);

    const mergeEdges = () =>
      mergeFieldSelections({ selectedFields, fieldName: 'edges' });

    expect(mergeEdges).toThrow(CommonQueryRunnerException);
    expect(mergeEdges).toThrow('Conflicting arguments for "x"');
  });
});
