import { type Request } from 'express';
import { parse } from 'graphql';

import {
  captureExecutedRootResolvers,
  extractTopLevelFieldsSafely,
} from 'src/engine/api/graphql/utils/capture-executed-root-resolvers.util';

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

describe('extractTopLevelFieldsSafely', () => {
  const names = (query: string, operationName?: string): string[] =>
    extractTopLevelFieldsSafely(parse(query), operationName).map(
      (field) => field.name.value,
    );

  it('should extract every root field of a single operation', () => {
    expect(
      names('mutation { createOneCompany { id } deleteManyPeople { id } }'),
    ).toEqual(['createOneCompany', 'deleteManyPeople']);
  });

  it('should extract only the operation selected by operationName', () => {
    expect(names(MULTI_OPERATION_QUERY, 'ReadPeople')).toEqual([
      'findManyPeople',
    ]);
    expect(names(MULTI_OPERATION_QUERY, 'WipePeople')).toEqual([
      'deleteManyPeople',
    ]);
  });

  it('should not depend on the client supplied operation name', () => {
    expect(names('mutation LooksHarmless { deleteManyPeople { id } }')).toEqual(
      ['deleteManyPeople'],
    );
  });

  it('should extract nothing when operationName selects no operation', () => {
    expect(names(MULTI_OPERATION_QUERY, 'Unknown')).toEqual([]);
  });

  it('should not throw when the document is ambiguous', () => {
    expect(names(MULTI_OPERATION_QUERY)).toEqual([]);
  });

  it('should follow a fragment spread at the root', () => {
    expect(
      names(`
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
});

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
