import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './graphql-resolvers-should-be-guarded';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(UserAuthGuard, NoPermissionGuard)
          testQuery() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
          testQuery() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(PublicEndpointGuard, NoPermissionGuard)
          testQuery() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(UserAuthGuard, NoPermissionGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(PublicEndpointGuard, NoPermissionGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Subscription()
          @UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
          testSubscription() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
        class TestResolver {
          @Subscription()
          testSubscription() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          regularMethod() {}
        }
      `,
    },
    {
      code: `
        class TestResolver {
          @ResolveField()
          testField() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard, SettingsPermissionGuard(PermissionFlagType.WORKSPACE))
        class TestResolver {
          @Mutation(() => String)
          async createSomething() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Mutation(() => String)
          @UseGuards(WorkspaceAuthGuard, SettingsPermissionGuard(PermissionFlagType.WORKSPACE))
          async createSomething() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Mutation(() => String)
          @UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
          async createSomething() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
        class TestResolver {
          @Mutation(() => String)
          async createSomething() {}
        }
      `,
      filename: 'test.tsx',
    },
  ],
  invalid: [
    {
      code: `
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
      errors: [
        {
          messageId: 'graphqlResolversShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Mutation()
          testMutation() {}
        }
      `,
      errors: [
        {
          messageId: 'graphqlResolversShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Subscription()
          testSubscription() {}
        }
      `,
      errors: [
        {
          messageId: 'graphqlResolversShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(UserAuthGuard)
          testQuery() {}
        }
      `,
      errors: [
        {
          messageId: 'graphqlResolversShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(CaptchaGuard)
          testQuery() {}
        }
      `,
      errors: [
        {
          messageId: 'graphqlResolversShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(CaptchaGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
      errors: [
        {
          messageId: 'graphqlResolversShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Subscription()
          @UseGuards(WorkspaceAuthGuard)
          testSubscription() {}
        }
      `,
      errors: [
        {
          messageId: 'graphqlResolversShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard)
        class TestResolver {
          @Subscription()
          testSubscription() {}
        }
      `,
      errors: [
        {
          messageId: 'graphqlResolversShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Mutation(() => String)
          @UseGuards(WorkspaceAuthGuard)
          async createSomething() {}
        }
      `,
      errors: [
        {
          messageId: 'graphqlResolversShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard)
        class TestResolver {
          @Mutation(() => String)
          async createSomething() {}
        }
      `,
      errors: [
        {
          messageId: 'graphqlResolversShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
  ],
});
