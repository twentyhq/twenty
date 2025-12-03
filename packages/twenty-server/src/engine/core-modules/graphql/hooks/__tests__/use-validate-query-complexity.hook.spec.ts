import {
  buildSchema,
  parse,
  validate,
  type ASTVisitor,
  type GraphQLError,
  type GraphQLSchema,
  type ValidationContext,
} from 'graphql';

import { useValidateQueryComplexity } from 'src/engine/core-modules/graphql/hooks/use-validate-query-complexity.hook';

describe('useValidateQueryComplexity', () => {
  let schema: GraphQLSchema;

  beforeAll(() => {
    schema = buildSchema(`
      type Query {
        user: User
        users: [User]
        posts: [Post]
        comments: [Comment]
      }

      type User {
        id: ID!
        name: String
        email: String
        posts: [Post]
        profile: Profile
      }

      type Profile {
        bio: String
        avatar: String
        settings: Settings
      }

      type Settings {
        theme: String
        notifications: Notifications
      }

      type Notifications {
        email: Boolean
        push: Boolean
      }

      type Post {
        id: ID!
        title: String
        content: String
        author: User
        comments: [Comment]
      }

      type Comment {
        id: ID!
        text: String
        author: User
        post: Post
      }
    `);
  });

  const extractValidationRule = (
    options: Parameters<typeof useValidateQueryComplexity>[0],
  ): ((context: ValidationContext) => ASTVisitor) => {
    const plugin = useValidateQueryComplexity(options);
    let capturedRule: ((context: ValidationContext) => ASTVisitor) | null =
      null;

    if (plugin.onValidate) {
      plugin.onValidate({
        addValidationRule: (rule) => {
          capturedRule = rule;
        },
        context: {} as unknown,
        validateFn: validate,
        params: {} as unknown,
        setValidationFn: () => {},
        setResult: () => {},
        extendContext: () => {},
      } as Parameters<NonNullable<typeof plugin.onValidate>>[0]);
    }

    if (!capturedRule) {
      throw new Error('Validation rule was not captured');
    }

    return capturedRule;
  };

  const validateQuery = (
    query: string,
    options: Parameters<typeof useValidateQueryComplexity>[0],
  ): readonly GraphQLError[] => {
    const rule = extractValidationRule(options);
    const document = parse(query);

    return validate(schema, document, [rule]);
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

      const errors = validateQuery(query, {
        maximumAllowedFields: 10,
        checkDuplicateRootResolvers: false,
      });

      expect(errors).toHaveLength(0);
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

      const errors = validateQuery(query, {
        maximumAllowedFields: 3,
        checkDuplicateRootResolvers: false,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Too many fields requested');
      expect(errors[0].message).toContain('Maximum allowed fields: 3');
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

      const errors = validateQuery(query, {
        checkDuplicateRootResolvers: false,
      });

      expect(errors).toHaveLength(0);
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

      const errors = validateQuery(query, {
        maximumAllowedRootResolvers: 3,
        checkDuplicateRootResolvers: false,
      });

      expect(errors).toHaveLength(0);
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

      const errors = validateQuery(query, {
        maximumAllowedRootResolvers: 2,
        checkDuplicateRootResolvers: false,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Too many root resolvers requested');
      expect(errors[0].message).toContain('Maximum allowed root resolvers: 2');
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

      const errors = validateQuery(query, {
        maximumAllowedNestedFields: 5,
        checkDuplicateRootResolvers: false,
      });

      expect(errors).toHaveLength(0);
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

      const errors = validateQuery(query, {
        maximumAllowedNestedFields: 3,
        checkDuplicateRootResolvers: false,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Too many nested fields requested');
      expect(errors[0].message).toContain('Maximum allowed nested fields: 3');
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

      const errors = validateQuery(query, {
        checkDuplicateRootResolvers: true,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Duplicate root resolver');
      expect(errors[0].message).toContain('user');
    });

    it('should fail when duplicate root resolvers are detected -  even when the field is aliased', () => {
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

      const errors = validateQuery(query, {
        checkDuplicateRootResolvers: true,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Duplicate root resolver');
      expect(errors[0].message).toContain('user');
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

      const errors = validateQuery(query, {
        maximumAllowedFields: 10,
        checkDuplicateRootResolvers: false,
      });

      expect(errors).toHaveLength(0);
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

      const errors = validateQuery(query, {
        maximumAllowedNestedFields: 3,
        checkDuplicateRootResolvers: false,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Too many nested fields requested');
    });
  });
});
