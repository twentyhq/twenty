import { type OperationDefinitionNode, parse } from 'graphql';

import { applyGraphqlVariableDefaults } from 'src/engine/api/graphql/direct-execution/utils/apply-graphql-variable-defaults.util';

const getOperation = (query: string) =>
  parse(query).definitions[0] as OperationDefinitionNode;

describe('applyGraphqlVariableDefaults', () => {
  const operation = getOperation(
    'query ($skip: Boolean = true, $first: Int = 5, $filter: PersonFilterInput) { people { totalCount } }',
  );

  it('fills omitted variables with their declared defaults', () => {
    expect(applyGraphqlVariableDefaults(operation, {})).toStrictEqual({
      skip: true,
      first: 5,
    });
  });

  it('keeps the values that were sent, including null', () => {
    expect(
      applyGraphqlVariableDefaults(operation, { skip: false, first: null }),
    ).toStrictEqual({ skip: false, first: null });
  });

  it('leaves variables unchanged without an operation', () => {
    expect(applyGraphqlVariableDefaults(undefined, { first: 1 })).toStrictEqual(
      { first: 1 },
    );
  });
});
