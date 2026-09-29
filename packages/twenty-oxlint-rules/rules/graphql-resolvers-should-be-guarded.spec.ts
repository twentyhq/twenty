import { RuleTester } from 'oxlint/plugins-dev';

import { REPLACED_CALLER_GUARD_NAMES } from '../utils/typedTokenHelpers';
import { rule, RULE_NAME } from './graphql-resolvers-should-be-guarded';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(CallerGuard({ userSession: true }), NoPermissionGuard)
          testQuery() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(CallerGuard({ userSession: true, apiKey: true }), CustomPermissionGuard)
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
        @UseGuards(CallerGuard({ userSession: true }), NoPermissionGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(CallerGuard({ userSession: true, apiKey: true }), CustomPermissionGuard)
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
          @UseGuards(CallerGuard({ userSession: true, apiKey: true }), NoPermissionGuard)
          testSubscription() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(CallerGuard({ userSession: true, apiKey: true }), NoPermissionGuard)
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
        @UseGuards(CallerGuard({ userSession: true, apiKey: true }), SettingsPermissionGuard(PermissionFlagType.WORKSPACE))
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
          @UseGuards(CallerGuard({ userSession: true, apiKey: true }), SettingsPermissionGuard(PermissionFlagType.WORKSPACE))
          async createSomething() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Mutation(() => String)
          @UseGuards(CallerGuard({ userSession: true, apiKey: true }), CustomPermissionGuard)
          async createSomething() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(CallerGuard({ userSession: true, apiKey: true }), CustomPermissionGuard)
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
          @Query()
          @UseGuards(
            CallerGuard({
              userSession: { impersonation: false, workspaceAgnostic: true },
              oauthClient: { requireUser: true },
              application: { requireUser: true },
            }),
            NoPermissionGuard,
          )
          testQuery() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(
            CallerGuard({ userSession: true, apiKey: false }),
            NoPermissionGuard,
          )
          testQuery() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(CallerGuard({ userSession: true }), NoPermissionGuard)
        class TestResolver {
          @Mutation(() => String)
          @UseGuards(CallerGuard({ userSession: { playground: false } }))
          async createSomething() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(
          CallerGuard({ userSession: true, apiKey: true }),
          NoPermissionGuard,
        )
        class TestResolver {
          @Query()
          @UseGuards(CallerGuard({ userSession: { impersonation: false } }))
          testQuery() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(
          CallerGuard({ oauthClient: { requireUser: true } }),
          NoPermissionGuard,
        )
        class TestResolver {
          @Query()
          @UseGuards(CallerGuard({ apiKey: true, oauthClient: true }))
          testQuery() {}
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
          @UseGuards(CallerGuard({ userSession: true }))
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
          @UseGuards(CallerGuard({ userSession: true, apiKey: true }))
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
        @UseGuards(CallerGuard({ userSession: true, apiKey: true }))
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
          @UseGuards(CallerGuard({ userSession: true, apiKey: true }))
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
        @UseGuards(CallerGuard({ userSession: true, apiKey: true }))
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
    ...REPLACED_CALLER_GUARD_NAMES.map((guardName) => ({
      code: `
        class TestResolver {
          @Query()
          @UseGuards(${guardName}, NoPermissionGuard)
          testQuery() {}
        }
      `,
      errors: [
        { messageId: 'graphqlResolversShouldBeGuarded' },
        { messageId: 'replacedCallerGuard', data: { guardName } },
      ],
      filename: 'test.tsx',
    })),
    {
      code: `
        @UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
      errors: [
        {
          messageId: 'replacedCallerGuard',
          data: { guardName: 'WorkspaceAuthGuard' },
        },
        { messageId: 'graphqlResolversShouldBeGuarded' },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Mutation()
          @UseGuards(
            CallerGuard({ userSession: true }),
            NoImpersonationGuard,
            NoPermissionGuard,
          )
          testMutation() {}
        }
      `,
      errors: [
        {
          messageId: 'replacedCallerGuard',
          data: { guardName: 'NoImpersonationGuard' },
        },
      ],
      filename: 'test.tsx',
    },
    ...[
      'CallerGuard(CALLER_GUARD_CONFIG)',
      'CallerGuard({ ...USER_SESSION_ONLY, apiKey: true })',
      'CallerGuard({ userSession: USER_SESSION_OPTIONS })',
      'CallerGuard({ userSession })',
      'CallerGuard()',
    ].map((callerGuard) => ({
      code: `
        class TestResolver {
          @Query()
          @UseGuards(${callerGuard}, NoPermissionGuard)
          testQuery() {}
        }
      `,
      errors: [
        { messageId: 'graphqlResolversShouldBeGuarded' },
        { messageId: 'callerGuardConfigNotInline' },
      ],
      filename: 'test.tsx',
    })),
    {
      code: `
        @UseGuards(CallerGuard(CALLER_GUARD_CONFIG), NoPermissionGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
      errors: [
        { messageId: 'callerGuardConfigNotInline' },
        { messageId: 'graphqlResolversShouldBeGuarded' },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(CallerGuard({}), NoPermissionGuard)
          testQuery() {}
        }
      `,
      errors: [{ messageId: 'callerGuardAcceptsNoCaller' }],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(CallerGuard({ apiKey: true }), NoPermissionGuard)
        class TestResolver {
          @Query()
          @UseGuards(CallerGuard({ userSession: true }))
          testQuery() {}
        }
      `,
      errors: [{ messageId: 'callerGuardsShareNoCaller' }],
      filename: 'test.tsx',
    },
  ],
});
