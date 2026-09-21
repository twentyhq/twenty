import { type Request } from 'express';
import { parse } from 'graphql';

import { captureExecutedRootResolvers } from 'src/engine/api/graphql/utils/capture-executed-root-resolvers.util';

describe('captureExecutedRootResolvers', () => {
  const capture = (
    query: string,
    operationName?: string,
  ): string[] | undefined => {
    const request = {} as Request;

    captureExecutedRootResolvers({
      request,
      document: parse(query),
      operationName,
    });

    return request.executedRootResolvers;
  };

  const MULTI_OPERATION_QUERY = `
    query ReadPeople {
      findManyPeople {
        id
      }
    }
    mutation WipePeople {
      deleteManyPeople {
        id
      }
    }
  `;

  it('should capture the root resolvers of a single operation', () => {
    expect(capture('mutation { createOneCompany { id } }')).toEqual([
      'createOneCompany',
    ]);
  });

  it('should capture every root resolver of the operation', () => {
    expect(
      capture('mutation { createOneCompany { id } deleteManyPeople { id } }'),
    ).toEqual(['createOneCompany', 'deleteManyPeople']);
  });

  it('should capture only the operation selected by operationName', () => {
    expect(capture(MULTI_OPERATION_QUERY, 'ReadPeople')).toEqual([
      'findManyPeople',
    ]);
    expect(capture(MULTI_OPERATION_QUERY, 'WipePeople')).toEqual([
      'deleteManyPeople',
    ]);
  });

  it('should not depend on the client supplied operation name', () => {
    expect(
      capture('mutation LooksHarmless { deleteManyPeople { id } }'),
    ).toEqual(['deleteManyPeople']);
  });

  it('should capture nothing when operationName selects no operation', () => {
    expect(capture(MULTI_OPERATION_QUERY, 'Unknown')).toEqual([]);
    expect(capture(MULTI_OPERATION_QUERY)).toEqual([]);
  });

  it('should capture root resolvers reached through a fragment spread', () => {
    expect(
      capture(`
        query ReadPeople {
          ...RootFields
        }
        fragment RootFields on Query {
          findManyPeople {
            id
          }
        }
      `),
    ).toEqual(['findManyPeople']);
  });

  it('should skip introspection fields', () => {
    expect(
      capture('query { __typename __schema { queryType { name } } }'),
    ).toEqual([]);
  });

  it('should not overwrite what an earlier pipeline already captured', () => {
    const request = { executedRootResolvers: ['companies'] } as Request;

    captureExecutedRootResolvers({
      request,
      document: parse('mutation { deleteManyPeople { id } }'),
      operationName: undefined,
    });

    expect(request.executedRootResolvers).toEqual(['companies']);
  });

  it('should tolerate a missing request', () => {
    expect(() =>
      captureExecutedRootResolvers({
        request: undefined,
        document: parse('query { findManyPeople { id } }'),
        operationName: undefined,
      }),
    ).not.toThrow();
  });
});
