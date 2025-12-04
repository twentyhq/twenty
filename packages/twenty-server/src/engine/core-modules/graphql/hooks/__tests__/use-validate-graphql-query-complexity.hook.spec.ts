import { parse } from 'graphql';

import { useValidateGraphqlQueryComplexity } from 'src/engine/core-modules/graphql/hooks/use-validate-graphql-query-complexity.hook';

describe('useValidateGraphqlQueryComplexity', () => {
  const validateQuery = (
    query: string,
    options: Parameters<typeof useValidateGraphqlQueryComplexity>[0],
  ): Error | null => {
    const plugin = useValidateGraphqlQueryComplexity(options);

    if (!plugin.onParse) {
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
        checkDuplicateRootResolvers: false,
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
        checkDuplicateRootResolvers: false,
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('Too many fields requested');
      expect(error?.message).toContain('Maximum allowed fields: 3');
    });

    it('should not enforce limit when maximumAllowedFields is undefined', () => {
      const query = `
        query {
          user {
            id
            name
            email
            posts {
              id
              title
            }
          }
        }
      `;

      const error = validateQuery(query, {
        checkDuplicateRootResolvers: false,
      });

      expect(error).toBeNull();
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
        checkDuplicateRootResolvers: false,
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
        checkDuplicateRootResolvers: false,
      });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('Too many root resolvers requested');
      expect(error?.message).toContain('Maximum allowed root resolvers: 2');
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
  });

  describe('fragment handling', () => {
    it('should handle nested fragment spreads', () => {
      const query = `
        fragment ProfileFields on Profile {
          bio
          avatar
        }

        fragment UserFields on User {
          id
          profile {
            ...ProfileFields
          }
        }

        query {
          user {
            ...UserFields
          }
        }
      `;

      const error = validateQuery(query, {
        maximumAllowedFields: 10,
        checkDuplicateRootResolvers: false,
      });

      expect(error).toBeNull();
    });

    it('should calculate depth correctly with fragments', () => {
      const query = `
        fragment DeepSettings on Settings {
          notifications {
            email
          }
        }

        fragment ProfileWithSettings on Profile {
          settings {
            ...DeepSettings
          }
        }

        query {
          user {
            profile {
              ...ProfileWithSettings
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
    });
  });
});
