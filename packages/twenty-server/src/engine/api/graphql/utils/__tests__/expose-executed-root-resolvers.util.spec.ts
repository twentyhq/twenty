import { type ServerResponse } from 'http';

import { parse } from 'graphql';

import { exposeExecutedRootResolvers } from 'src/engine/api/graphql/utils/expose-executed-root-resolvers.util';

describe('exposeExecutedRootResolvers', () => {
  const capture = ({
    query,
    operationName,
    headersSent = false,
  }: {
    query: string;
    operationName?: string;
    headersSent?: boolean;
  }): string | undefined => {
    const headers: Record<string, string> = {};
    const response = {
      headersSent,
      setHeader: (key: string, value: string) => {
        headers[key] = value;
      },
    } as unknown as ServerResponse;

    exposeExecutedRootResolvers({
      response,
      document: parse(query),
      operationName,
    });

    return headers['X-Twenty-Resolvers'];
  };

  it('should expose the root resolvers of a single operation', () => {
    expect(capture({ query: 'mutation { createOneCompany { id } }' })).toBe(
      'createOneCompany',
    );
  });

  it('should expose only the operation selected by operationName', () => {
    const query = `
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

    expect(capture({ query, operationName: 'ReadPeople' })).toBe(
      'findManyPeople',
    );
    expect(capture({ query, operationName: 'WipePeople' })).toBe(
      'deleteManyPeople',
    );
  });

  it('should expose nothing when operationName selects no operation', () => {
    const query = `
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

    expect(capture({ query, operationName: 'Unknown' })).toBeUndefined();
    expect(capture({ query })).toBeUndefined();
  });

  it('should expose root resolvers reached through fragments', () => {
    expect(
      capture({
        query: `
          query ReadPeople {
            ...RootFields
          }
          fragment RootFields on Query {
            findManyPeople {
              id
            }
          }
        `,
      }),
    ).toBe('findManyPeople');
  });

  it('should skip introspection fields', () => {
    expect(
      capture({
        query: 'query { __typename __schema { queryType { name } } }',
      }),
    ).toBeUndefined();
  });

  it('should truncate a long list with a remainder count', () => {
    const resolvers = Array.from(
      { length: 40 },
      (_unused, index) => `findManyVeryLongObjectName${index}`,
    );
    const header = capture({
      query: `query { ${resolvers.map((name) => `${name} { id }`).join(' ')} }`,
    });

    expect(header).toMatch(/,\+\d+$/);
    expect(header?.length).toBeLessThanOrEqual(520);
  });

  it('should not set the header once the response has been sent', () => {
    expect(
      capture({
        query: 'mutation { createOneCompany { id } }',
        headersSent: true,
      }),
    ).toBeUndefined();
  });

  it('should tolerate a missing response', () => {
    expect(() =>
      exposeExecutedRootResolvers({
        response: undefined,
        document: parse('query { findManyPeople { id } }'),
        operationName: undefined,
      }),
    ).not.toThrow();
  });
});
