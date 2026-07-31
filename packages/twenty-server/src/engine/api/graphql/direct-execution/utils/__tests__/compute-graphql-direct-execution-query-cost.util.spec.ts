import { parse } from 'graphql';

import { computeGraphQLDirectExecutionQueryCost } from 'src/engine/api/graphql/direct-execution/utils/compute-graphql-direct-execution-query-cost.util';
import { extractArgumentsFromAst } from 'src/engine/api/graphql/direct-execution/utils/extract-arguments-from-ast.util';
import { graphQLBuildFragmentMap } from 'src/engine/api/graphql/direct-execution/utils/graphql-build-fragment-map.util';
import { graphQLExtractTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/graphql-extract-top-level-fields.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';

describe('computeGraphQLDirectExecutionQueryCost', () => {
  it('multiplies selected fields by the requested row count', () => {
    const document = parse(`
      query FindPeople($first: Int!) {
        people(first: $first) {
          edges {
            node {
              id
              name {
                firstName
                lastName
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `);
    const variables = { first: 25 };
    const [field] = graphQLExtractTopLevelFields(document, 'FindPeople');

    const result = computeGraphQLDirectExecutionQueryCost({
      rootFields: [
        {
          field,
          method: RESOLVER_METHOD_NAMES.FIND_MANY,
          args: extractArgumentsFromAst(field.arguments, variables),
        },
      ],
      fragmentMap: graphQLBuildFragmentMap(document),
    });

    expect(result).toEqual({
      estimatedResultFieldCount: 125,
      requestedRowCount: 25,
      selectedLeafFieldCount: 5,
    });
  });

  it('uses the maximum page size when find many has no explicit limit', () => {
    const document = parse(`
      query FindPeople {
        people {
          edges {
            node {
              id
              name {
                firstName
              }
            }
          }
        }
      }
    `);
    const [field] = graphQLExtractTopLevelFields(document, 'FindPeople');

    const result = computeGraphQLDirectExecutionQueryCost({
      rootFields: [
        {
          field,
          method: RESOLVER_METHOD_NAMES.FIND_MANY,
          args: {},
        },
      ],
      fragmentMap: graphQLBuildFragmentMap(document),
    });

    expect(result).toEqual({
      estimatedResultFieldCount: 400,
      requestedRowCount: 200,
      selectedLeafFieldCount: 2,
    });
  });

  it('counts fragment fields and combines root resolver costs', () => {
    const document = parse(`
      query FindRecords {
        people(first: 10) {
          edges {
            node {
              ...PersonFields
            }
          }
        }
        findOneCompany(filter: { id: { eq: "company-id" } }) {
          id
          name
        }
      }

      fragment PersonFields on Person {
        id
        jobTitle
      }
    `);
    const fields = graphQLExtractTopLevelFields(document, 'FindRecords');

    const result = computeGraphQLDirectExecutionQueryCost({
      rootFields: [
        {
          field: fields[0],
          method: RESOLVER_METHOD_NAMES.FIND_MANY,
          args: extractArgumentsFromAst(fields[0].arguments, {}),
        },
        {
          field: fields[1],
          method: RESOLVER_METHOD_NAMES.FIND_ONE,
          args: extractArgumentsFromAst(fields[1].arguments, {}),
        },
      ],
      fragmentMap: graphQLBuildFragmentMap(document),
    });

    expect(result).toEqual({
      estimatedResultFieldCount: 22,
      requestedRowCount: 11,
      selectedLeafFieldCount: 4,
    });
  });
});
