import { parse } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { useValidateGraphqlQueryComplexity } from 'src/engine/core-modules/graphql/hooks/use-validate-graphql-query-complexity.hook';

describe('useValidateGraphqlQueryComplexity', () => {
  const validateQuery = (
    query: string,
    options: Parameters<typeof useValidateGraphqlQueryComplexity>[0],
  ): Error | null => {
    const plugin = useValidateGraphqlQueryComplexity(options);

    if (!isDefined(plugin.onParse)) {
      throw new Error('onParse hook not found');
    }

    const document = parse(query);

    const onParseResult = plugin.onParse({
      context: {},
      params: { source: query },
      parseFn: parse,
      setParseFn: () => {},
      setParsedDocument: () => {},
      extendContext: () => {},
    } as any);

    if (typeof onParseResult !== 'function') {
      return null;
    }

    try {
      onParseResult({
        result: document,
        replaceParseResult: () => {},
      } as any);

      return null;
    } catch (error) {
      return error as Error;
    }
  };

  const captureResolversHeader = (
    query: string,
    options: Parameters<typeof useValidateGraphqlQueryComplexity>[0] = {},
    operationName?: string,
  ): { header: string | undefined; error: Error | null } => {
    const plugin = useValidateGraphqlQueryComplexity(options);

    if (!isDefined(plugin.onParse)) {
      throw new Error('onParse hook not found');
    }

    const headers: Record<string, string> = {};
    const res = {
      setHeader: (key: string, value: string) => {
        headers[key] = value;
      },
    };

    const onParseResult = plugin.onParse({
      context: { res, params: { operationName } },
      params: { source: query },
      parseFn: parse,
      setParseFn: () => {},
      setParsedDocument: () => {},
      extendContext: () => {},
    } as any);

    if (typeof onParseResult !== 'function') {
      return { header: undefined, error: null };
    }

    let error: Error | null = null;

    try {
      onParseResult({
        result: parse(query),
        replaceParseResult: () => {},
      } as any);
    } catch (thrown) {
      error = thrown as Error;
    }

    return { header: headers['X-Twenty-Resolvers'], error };
  };

  describe('maximumAllowedFields', () => {
    it('should pass when fields count is within limit', () => {
      const query = `
        query {
          user {
            id
            name
          }
        }
      `;

      const error = validateQuery(query, {
        maximumAllowedFields: 10,
      });

      expect(error).toBeNull();
    });

    it('should fail when fields count exceeds limit', () => {
      const query = `
        query {
          user {
            id
            name
            email
          }
        }
      `;

      const error = validateQuery(query, {
        maximumAllowedFields: 3,
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('Too many fields requested');
      expect(error?.message).toContain('Maximum allowed fields: 3');
    });
  });

  describe('maximumAllowedRootResolvers', () => {
    it('should pass when root resolvers count is within limit', () => {
      const query = `
        query {
          user {
            id
          }
          posts {
            id
          }
        }
      `;

      const error = validateQuery(query, {
        maximumAllowedRootResolvers: 3,
      });

      expect(error).toBeNull();
    });

    it('should fail when root resolvers count exceeds limit', () => {
      const query = `
        query {
          user {
            id
          }
          posts {
            id
          }
          comments {
            id
          }
        }
      `;

      const error = validateQuery(query, {
        maximumAllowedRootResolvers: 2,
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('Too many root resolvers requested');
      expect(error?.message).toContain('Maximum allowed root resolvers: 2');
    });

    it('should fail when root resolvers count exceeds limit -  multiple queries', () => {
      const query = `
        query {
          user {
            id
          }
          posts {
            id
          }
          comments {
            id
          }
        }
        query {
          user {
            id
          }
          posts {
            id
          }
          comments {
            id
          }
        }
      `;

      const error = validateQuery(query, {
        maximumAllowedRootResolvers: 4,
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain(
        'Query too complex - Too many root resolvers requested: 6 - Maximum allowed root resolvers: 4',
      );
    });

    it('should fail when root resolvers count exceeds limit -  fragment', () => {
      const query = `
        fragment UserFields on User {
          id
        }

        fragment PostFields on Post {
          id
        }

        fragment CommentFields on Comment {
          id
        }

        query {
          ...UserFields
          ...PostFields
          ...CommentFields
        }

        query {
          ...UserFields
          ...PostFields
          ...CommentFields
        }
      `;

      const error = validateQuery(query, {
        maximumAllowedRootResolvers: 4,
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain(
        'Query too complex - Too many root resolvers requested: 6 - Maximum allowed root resolvers: 4',
      );
    });
  });

  describe('maximumAllowedNestedFields', () => {
    it('should pass when depth is within limit', () => {
      const query = `
        query {
          user {
            profile {
              bio
            }
          }
        }
      `;

      const error = validateQuery(query, {
        maximumAllowedNestedFields: 5,
        checkDuplicateRootResolvers: false,
      });

      expect(error).toBeNull();
    });

    it('should fail when depth exceeds limit', () => {
      const query = `
        query {
          user {
            profile {
              settings {
                notifications {
                  email
                }
              }
            }
          }
        }
      `;

      const error = validateQuery(query, {
        maximumAllowedNestedFields: 3,
        checkDuplicateRootResolvers: false,
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('Too many nested fields requested');
      expect(error?.message).toContain('Maximum allowed nested fields: 3');
    });

    it('should fail when depth exceeds limit - fragment', () => {
      const query = `
        fragment UserFields on User {
          profile {
            settings {
              notifications {
                email
              }
            }
          }
        }

        query {
          user {
            nested {
            ...UserFields
            }
          }
        }
      `;

      const error = validateQuery(query, { maximumAllowedNestedFields: 1 });

      expect(error).not.toBeNull();
      expect(error?.message).toContain(
        'Query too complex - Too many nested fields requested: 6 - Maximum allowed nested fields: 1',
      );
    });
  });

  describe('checkDuplicateRootResolvers', () => {
    it('should fail when duplicate root resolvers are detected', () => {
      const query = `
        query {
          user {
            id
          }
          user {
            name
          }
        }
      `;

      const error = validateQuery(query, {
        checkDuplicateRootResolvers: true,
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('Duplicate root resolver');
      expect(error?.message).toContain('user');
    });

    it('should fail when duplicate root resolvers are detected - even when the field is aliased', () => {
      const query = `
        query {
          user {
            id
          }
          alias: user {
            name
          }
        }
      `;

      const error = validateQuery(query, {
        checkDuplicateRootResolvers: true,
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('Duplicate root resolver');
      expect(error?.message).toContain('user');
    });

    it('should fail when duplicate root resolvers are detected - multiple queries', () => {
      const query = `
        query {
          user {
            id
          }
        }
        query {
          user {
            id
          }
        }
      `;

      const error = validateQuery(query, {
        checkDuplicateRootResolvers: true,
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('Duplicate root resolver');
      expect(error?.message).toContain('user');
    });
  });
  describe('X-Twenty-Resolvers header', () => {
    it('should expose every root resolver of the operation', () => {
      const { header } = captureResolversHeader(`
        mutation {
          createOneCompany {
            id
          }
          deleteManyPeople {
            id
          }
        }
      `);

      expect(header).toBe('createOneCompany,deleteManyPeople');
    });

    it('should not depend on the client supplied operation name', () => {
      const { header } = captureResolversHeader(`
        mutation LooksHarmless {
          deleteManyPeople {
            id
          }
        }
      `);

      expect(header).toBe('deleteManyPeople');
    });

    it('should expose resolvers of a query rejected for complexity', () => {
      const { header, error } = captureResolversHeader(
        `
          query {
            userOne {
              id
            }
            userTwo {
              id
            }
          }
        `,
        { maximumAllowedRootResolvers: 1 },
      );

      expect(error).not.toBeNull();
      expect(header).toBe('userOne,userTwo');
    });

    it('should expose only the executed operation of a multi operation document', () => {
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

      expect(captureResolversHeader(query, {}, 'ReadPeople').header).toBe(
        'findManyPeople',
      );
      expect(captureResolversHeader(query, {}, 'WipePeople').header).toBe(
        'deleteManyPeople',
      );
    });

    it('should not set the header when operationName does not select an operation', () => {
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

      expect(
        captureResolversHeader(query, {}, 'Unknown').header,
      ).toBeUndefined();
      expect(captureResolversHeader(query).header).toBeUndefined();
    });

    it('should expose the single operation when no operationName is given', () => {
      const { header } = captureResolversHeader(`
        query {
          findManyPeople {
            id
          }
        }
      `);

      expect(header).toBe('findManyPeople');
    });

    it('should expose root resolvers reached through a fragment spread', () => {
      const { header } = captureResolversHeader(`
        query ReadPeople {
          ...RootFields
        }
        fragment RootFields on Query {
          findManyPeople {
            id
          }
        }
      `);

      expect(header).toBe('findManyPeople');
    });

    it('should truncate a long resolver list with a remainder count', () => {
      const resolvers = Array.from(
        { length: 40 },
        (_unused, index) => `findManyVeryLongObjectName${index}`,
      );
      const { header } = captureResolversHeader(`
        query {
          ${resolvers.map((name) => `${name} { id }`).join('\n')}
        }
      `);

      expect(header).toMatch(/,\+\d+$/);
      expect(header?.length).toBeLessThanOrEqual(520);
    });

    it('should not set the header when the context carries no response', () => {
      const plugin = useValidateGraphqlQueryComplexity({});

      expect(() => {
        const onParseResult = plugin.onParse?.({
          context: {},
          params: { source: '{ user { id } }' },
          parseFn: parse,
          setParseFn: () => {},
          setParsedDocument: () => {},
          extendContext: () => {},
        } as any);

        if (typeof onParseResult === 'function') {
          onParseResult({
            result: parse('{ user { id } }'),
            replaceParseResult: () => {},
          } as any);
        }
      }).not.toThrow();
    });
  });
});
