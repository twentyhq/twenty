import { RuleTester } from 'oxlint/plugins-dev';

import {
  rule,
  RULE_NAME,
} from './graphql-field-resolvers-should-declare-access';

const ACCEPT_USER_SESSIONS =
  'AccessPolicyGuard({ authPrincipals: { userSession: true, apiKey: false, oauthClient: false, application: false }, requiredPermissionFlags: [PermissionFlagType.WORKSPACE_MEMBERS] })';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        @Resolver(() => WorkspaceDTO)
        class TestResolver {
          @ResolveField(() => String)
          @UseGuards(NoPermissionGuard)
          testField() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @ResolveField(() => String)
          @UseGuards(AccessPolicyGuard(WORKSPACE_MEMBERS_ACCESS_POLICY))
          testField() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @UseGuards(${ACCEPT_USER_SESSIONS})
          @ResolveField(() => String, { nullable: true })
          testField() {}
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
          regularMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
  ],
  invalid: [
    {
      code: `
        class TestResolver {
          @ResolveField(() => String)
          testField() {}
        }
      `,
      errors: [{ messageId: 'graphqlFieldResolversShouldDeclareAccess' }],
      filename: 'test.tsx',
    },
    ...[
      'CustomPermissionGuard',
      'PublicEndpointGuard',
      'AccessPolicyGuard(VIEW_POLICY)',
      'AccessPolicyGuard({ ...WORKSPACE_MEMBERS_ACCESS_POLICY })',
      'AccessPolicyGuard()',
    ].map((guard) => ({
      code: `
        class TestResolver {
          @ResolveField(() => String)
          @UseGuards(${guard})
          testField() {}
        }
      `,
      errors: [{ messageId: 'graphqlFieldResolversShouldDeclareAccess' }],
      filename: 'test.tsx',
    })),
    ...[
      'AccessPolicyGuard(WORKSPACE_MEMBERS_ACCESS_POLICY)',
      'NoPermissionGuard',
    ].map((classGuard) => ({
      code: `
        @UseGuards(${classGuard})
        class TestResolver {
          @ResolveField(() => String)
          testField() {}
        }
      `,
      errors: [
        { messageId: 'classGuardOnFieldResolverClass' },
        { messageId: 'graphqlFieldResolversShouldDeclareAccess' },
      ],
      filename: 'test.tsx',
    })),
    {
      code: `
        @UseGuards(AccessPolicyGuard(VIEW_READ_ACCESS_POLICY))
        class TestResolver {
          @Query()
          testQuery() {}

          @ResolveField(() => String)
          @UseGuards(NoPermissionGuard)
          testField() {}
        }
      `,
      errors: [{ messageId: 'classGuardOnFieldResolverClass' }],
      filename: 'test.tsx',
    },
  ],
});
