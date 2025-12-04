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
});
