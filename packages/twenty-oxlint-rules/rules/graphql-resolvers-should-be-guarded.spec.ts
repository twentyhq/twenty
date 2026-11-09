import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './graphql-resolvers-should-be-guarded';

const ACCEPT_EVERY_PRINCIPAL =
  'AccessPolicyGuard({ authPrincipals: { userSession: true, apiKey: true, oauthClient: true, application: true }, requiredPermissionFlags: [] })';

const ACCEPT_USER_SESSIONS =
  'AccessPolicyGuard({ authPrincipals: { userSession: true, apiKey: false, oauthClient: false, application: false }, requiredPermissionFlags: [PermissionFlagType.WORKSPACE] })';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        class TestResolver {
          @Mutation()
          @UseGuards(AccessPolicyGuard(VIEW_WRITE_ACCESS_POLICY))
          testMutation() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(AccessPolicyGuard(VIEW_READ_ACCESS_POLICY))
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
          @Mutation()
          @UseGuards(${ACCEPT_USER_SESSIONS})
          testMutation() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(AccessPolicyGuard({ authPrincipals: { userSession: { standard: true, impersonated: false, playground: true, workspaceAgnostic: false }, apiKey: false, oauthClient: { withUser: true, withoutUser: false }, application: { withUser: true, withoutUser: false } }, requiredPermissionFlags: [], requiredFeatureFlags: [FeatureFlagKey.IS_GETTING_STARTED_ENABLED] }))
          testQuery() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, CustomPermissionGuard)
          testQuery() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(${ACCEPT_EVERY_PRINCIPAL})
        class TestResolver {
          @Mutation(() => String)
          @UseGuards(CustomPermissionGuard)
          async duplicateSomething() {}
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
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL})
          testSubscription() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(${ACCEPT_EVERY_PRINCIPAL})
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
  ],
  invalid: [
    ...['Query', 'Mutation', 'Subscription'].map((operationDecorator) => ({
      code: `
        class TestResolver {
          @${operationDecorator}()
          testOperation() {}
        }
      `,
      errors: [{ messageId: 'graphqlResolversShouldBeGuarded' }],
      filename: 'test.tsx',
    })),
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(CaptchaGuard)
          testQuery() {}
        }
      `,
      errors: [{ messageId: 'graphqlResolversShouldBeGuarded' }],
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
      errors: [{ messageId: 'graphqlResolversShouldBeGuarded' }],
      filename: 'test.tsx',
    },
    ...['NoPermissionGuard', 'CustomPermissionGuard'].map(
      (permissionGuard) => ({
        code: `
        class TestResolver {
          @Mutation()
          @UseGuards(${permissionGuard})
          testMutation() {}
        }
      `,
        errors: [{ messageId: 'graphqlResolversShouldBeGuarded' }],
        filename: 'test.tsx',
      }),
    ),
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(AuthPrincipalGuard({ userSession: true, apiKey: true, oauthClient: true, application: true }), NoPermissionGuard)
          testQuery() {}
        }
      `,
      errors: [{ messageId: 'graphqlResolversShouldBeGuarded' }],
      filename: 'test.tsx',
    },
    ...[
      'AccessPolicyGuard({ ...VIEW_WRITE_ACCESS_POLICY })',
      'AccessPolicyGuard({})',
      'AccessPolicyGuard({ authPrincipals: {}, requiredPermissionFlags: [] })',
      'AccessPolicyGuard({ authPrincipals: { userSession: false, apiKey: true, oauthClient: false, application: false } })',
      'AccessPolicyGuard({ authPrincipals, requiredPermissionFlags: [] })',
      'AccessPolicyGuard({ authPrincipals: { ...USER_SESSIONS_ONLY, apiKey: true }, requiredPermissionFlags: [] })',
      'AccessPolicyGuard({ authPrincipals: { userSession: USER_SESSION_VARIANTS, apiKey: false, oauthClient: false, application: false }, requiredPermissionFlags: [] })',
      'AccessPolicyGuard({ authPrincipals: { userSession: false, apiKey: true, oauthClient: false, application: false }, requiredPermissionFlags: [...VIEW_FLAGS] })',
      'AccessPolicyGuard({ authPrincipals: { userSession: false, apiKey: true, oauthClient: false, application: false }, requiredPermissionFlags: VIEW_FLAGS })',
      'AccessPolicyGuard(VIEW_POLICY)',
      'AccessPolicyGuard()',
    ].map((accessPolicyGuard) => ({
      code: `
        class TestResolver {
          @Mutation()
          @UseGuards(${accessPolicyGuard})
          testMutation() {}
        }
      `,
      errors: [
        { messageId: 'graphqlResolversShouldBeGuarded' },
        { messageId: 'accessPolicyGuardWithoutPolicy' },
      ],
      filename: 'test.tsx',
    })),
    {
      code: `
        @UseGuards(AccessPolicyGuard(VIEW_READ_ACCESS_POLICY))
        class TestResolver {
          @Mutation()
          @UseGuards(AccessPolicyGuard(VIEW_WRITE_ACCESS_POLICY))
          testMutation() {}
        }
      `,
      errors: [{ messageId: 'accessPolicyGuardOnClassAndMethod' }],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(WorkspaceAuthGuard, AccessPolicyGuard(VIEW_READ_ACCESS_POLICY))
          testQuery() {}
        }
      `,
      errors: [{ messageId: 'accessPolicyGuardNotFirst' }],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @UseGuards(CustomPermissionGuard)
          @Mutation()
          @UseGuards(AccessPolicyGuard(VIEW_WRITE_ACCESS_POLICY))
          testMutation() {}
        }
      `,
      errors: [{ messageId: 'stackedUseGuards' }],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(AccessPolicyGuard(VIEW_READ_ACCESS_POLICY))
        @UseGuards(CustomPermissionGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
      errors: [{ messageId: 'stackedUseGuards' }],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(CustomPermissionGuard)
        class TestResolver {
          @Query()
          @UseGuards(AccessPolicyGuard(TIMELINE_READ_ACCESS_POLICY))
          testQuery() {}

          @Query()
          @UseGuards(AccessPolicyGuard(TIMELINE_READ_ACCESS_POLICY))
          otherQuery() {}
        }
      `,
      errors: [{ messageId: 'classGuardBeforeMethodAccessPolicy' }],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(CustomPermissionGuard, ${ACCEPT_EVERY_PRINCIPAL})
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
      errors: [{ messageId: 'accessPolicyGuardNotFirst' }],
      filename: 'test.tsx',
    },
  ],
});
