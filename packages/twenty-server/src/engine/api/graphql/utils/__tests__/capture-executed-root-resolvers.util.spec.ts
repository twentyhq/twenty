import { type Request } from 'express';
import { parse } from 'graphql';

import { captureExecutedRootResolvers } from 'src/engine/api/graphql/utils/capture-executed-root-resolvers.util';
import { extractTopLevelFieldsSafely } from 'src/engine/api/graphql/utils/extract-top-level-fields-safely.util';

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

describe('captureExecutedRootResolvers', () => {
  const capture = (
    query: string,
    operationName?: string,
  ): string[] | undefined => {
    const request = {} as Request;

    captureExecutedRootResolvers({
      request,
      topLevelFields: extractTopLevelFieldsSafely(parse(query), operationName),
    });

    return request.executedRootResolvers;
  };

  it('should record the executed root resolvers', () => {
    expect(capture('mutation { createOneCompany { id } }')).toEqual([
      'createOneCompany',
    ]);
  });

  it('should record only the operation selected by operationName', () => {
    expect(capture(MULTI_OPERATION_QUERY, 'WipePeople')).toEqual([
      'deleteManyPeople',
    ]);
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
      topLevelFields: extractTopLevelFieldsSafely(
        parse('mutation { deleteManyPeople { id } }'),
        undefined,
      ),
    });

    expect(request.executedRootResolvers).toEqual(['companies']);
  });

  it('should tolerate a missing request', () => {
    expect(() =>
      captureExecutedRootResolvers({
        request: undefined,
        topLevelFields: [],
      }),
    ).not.toThrow();
  });
});
