import { RuleTester } from 'oxlint/plugins-dev';

import { REPLACED_AUTH_GUARD_NAMES } from '../utils/typedTokenHelpers';
import { rule, RULE_NAME } from './graphql-resolvers-should-be-guarded';

const ACCEPT_EVERY_PRINCIPAL =
  'AuthPrincipalGuard({ userSession: true, apiKey: true, oauthClient: true, application: true })';

const ACCEPT_USER_SESSIONS =
  'AuthPrincipalGuard({ userSession: true, apiKey: false, oauthClient: false, application: false })';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(${ACCEPT_USER_SESSIONS}, NoPermissionGuard)
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
        @UseGuards(${ACCEPT_USER_SESSIONS}, NoPermissionGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, CustomPermissionGuard)
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
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, NoPermissionGuard)
          testSubscription() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, NoPermissionGuard)
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
        @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, SettingsPermissionGuard(PermissionFlagType.WORKSPACE))
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
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, SettingsPermissionGuard(PermissionFlagType.WORKSPACE))
          async createSomething() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Mutation(() => String)
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, CustomPermissionGuard)
          async createSomething() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, CustomPermissionGuard)
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
            AuthPrincipalGuard({
              userSession: {
                standard: true,
                impersonated: false,
                playground: true,
                workspaceAgnostic: false,
              },
              apiKey: false,
              oauthClient: { withUser: true, withoutUser: false },
              application: { withUser: true, withoutUser: false },
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
        @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, NoPermissionGuard)
        class TestResolver {
          @Mutation(() => String)
          @UseGuards(
            AuthPrincipalGuard({
              userSession: {
                standard: true,
                impersonated: true,
                playground: false,
                workspaceAgnostic: false,
              },
              apiKey: false,
              oauthClient: false,
              application: false,
            }),
          )
          async createSomething() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(${ACCEPT_USER_SESSIONS}, NoPermissionGuard)
        class TestResolver {
          @Query()
          @UseGuards(${ACCEPT_USER_SESSIONS})
          testQuery() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(
          AuthPrincipalGuard({
            userSession: {
              standard: true,
              impersonated: true,
              playground: true,
              workspaceAgnostic: false,
            },
            apiKey: false,
            oauthClient: { withUser: true, withoutUser: false },
            application: true,
          }),
          NoPermissionGuard,
        )
        class TestResolver {
          @Query()
          @UseGuards(
            AuthPrincipalGuard({
              userSession: {
                standard: true,
                impersonated: false,
                playground: true,
                workspaceAgnostic: false,
              },
              apiKey: false,
              oauthClient: { withUser: true, withoutUser: false },
              application: { withUser: true, withoutUser: false },
            }),
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
            ${ACCEPT_EVERY_PRINCIPAL},
            FeatureFlagGuard,
            SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
          )
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
          @UseGuards(${ACCEPT_USER_SESSIONS})
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
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL})
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
        @UseGuards(${ACCEPT_EVERY_PRINCIPAL})
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
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL})
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
        @UseGuards(${ACCEPT_EVERY_PRINCIPAL})
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
    ...REPLACED_AUTH_GUARD_NAMES.map((guardName) => ({
      code: `
        class TestResolver {
          @Query()
          @UseGuards(${guardName}, NoPermissionGuard)
          testQuery() {}
        }
      `,
      errors: [
        { messageId: 'graphqlResolversShouldBeGuarded' },
        { messageId: 'replacedByAuthPrincipalGuard', data: { guardName } },
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
          messageId: 'replacedByAuthPrincipalGuard',
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
            ${ACCEPT_USER_SESSIONS},
            NoImpersonationGuard,
            NoPermissionGuard,
          )
          testMutation() {}
        }
      `,
      errors: [
        {
          messageId: 'replacedByAuthPrincipalGuard',
          data: { guardName: 'NoImpersonationGuard' },
        },
      ],
      filename: 'test.tsx',
    },
    ...[
      'AuthPrincipalGuard(AUTH_PRINCIPAL_GUARD_CONFIG)',
      'AuthPrincipalGuard({ ...USER_SESSIONS_ONLY, apiKey: true })',
      'AuthPrincipalGuard({ userSession: USER_SESSION_VARIANTS, apiKey: false, oauthClient: false, application: false })',
      'AuthPrincipalGuard({ userSession, apiKey: false, oauthClient: false, application: false })',
      'AuthPrincipalGuard()',
    ].map((authPrincipalGuard) => ({
      code: `
        class TestResolver {
          @Query()
          @UseGuards(${authPrincipalGuard}, NoPermissionGuard)
          testQuery() {}
        }
      `,
      errors: [
        { messageId: 'graphqlResolversShouldBeGuarded' },
        { messageId: 'authPrincipalGuardConfigNotInline' },
      ],
      filename: 'test.tsx',
    })),
    {
      code: `
        @UseGuards(AuthPrincipalGuard(AUTH_PRINCIPAL_GUARD_CONFIG), NoPermissionGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
      errors: [
        { messageId: 'authPrincipalGuardConfigNotInline' },
        { messageId: 'graphqlResolversShouldBeGuarded' },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(
          AuthPrincipalGuard({
            userSession: {
              standard: true,
              impersonated: true,
              playground: true,
              workspaceAgnostic: false,
            },
            apiKey: false,
            oauthClient: false,
            application: false,
          }),
          NoPermissionGuard,
        )
        class TestResolver {
          @Query()
          @UseGuards(${ACCEPT_USER_SESSIONS})
          testQuery() {}
        }
      `,
      errors: [
        {
          messageId: 'authPrincipalGuardWiderThanClass',
          data: { principalVariants: 'userSession.workspaceAgnostic' },
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(
          AuthPrincipalGuard({
            userSession: false,
            apiKey: true,
            oauthClient: false,
            application: { withUser: true, withoutUser: false },
          }),
          NoPermissionGuard,
        )
        class TestResolver {
          @Mutation()
          @UseGuards(
            AuthPrincipalGuard({
              userSession: {
                standard: true,
                impersonated: false,
                playground: false,
                workspaceAgnostic: false,
              },
              apiKey: true,
              oauthClient: false,
              application: true,
            }),
          )
          testMutation() {}
        }
      `,
      errors: [
        {
          messageId: 'authPrincipalGuardWiderThanClass',
          data: {
            principalVariants: 'userSession.standard, application.withoutUser',
          },
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(NoPermissionGuard, ${ACCEPT_USER_SESSIONS})
          testQuery() {}
        }
      `,
      errors: [{ messageId: 'authPrincipalGuardNotFirst' }],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(FeatureFlagGuard, ${ACCEPT_EVERY_PRINCIPAL}, NoPermissionGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
      errors: [{ messageId: 'authPrincipalGuardNotFirst' }],
      filename: 'test.tsx',
    },
  ],
});
