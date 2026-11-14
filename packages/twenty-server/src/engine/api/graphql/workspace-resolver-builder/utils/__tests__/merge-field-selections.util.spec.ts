import { Kind, parse } from 'graphql';

import { getResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-resolver-selected-fields.util';
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
});
