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
          @ResolveField(() => String, { nullable: true })
          @UseGuards(${ACCEPT_USER_SESSIONS})
          testField() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(AccessPolicyGuard(WORKSPACE_MEMBERS_ACCESS_POLICY))
        class TestResolver {
          @ResolveField(() => String)
          testField() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(NoPermissionGuard)
        class TestResolver {
          @ResolveField(() => String)
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
        @UseGuards(AccessPolicyGuard(VIEW_READ_ACCESS_POLICY))
        @UseGuards(CustomPermissionGuard)
        class TestResolver {
          @Query()
          testQuery() {}

          @ResolveField(() => String)
          @UseGuards(NoPermissionGuard)
          testField() {}
        }
      `,
      errors: [
        { messageId: 'classGuardOnRootsAndFieldResolvers' },
        { messageId: 'classGuardOnRootsAndFieldResolvers' },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(NoPermissionGuard)
        @UseGuards(CustomPermissionGuard)
        class TestResolver {
          @ResolveField(() => String)
          testField() {}
        }
      `,
      errors: [{ messageId: 'stackedUseGuards' }],
      filename: 'test.tsx',
    },
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
    ...['CustomPermissionGuard', 'PublicEndpointGuard'].map((guard) => ({
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
      'AccessPolicyGuard(VIEW_POLICY)',
      'AccessPolicyGuard({ ...WORKSPACE_MEMBERS_ACCESS_POLICY })',
      'AccessPolicyGuard()',
    ].map((accessPolicyGuard) => ({
      code: `
        class TestResolver {
          @ResolveField(() => String)
          @UseGuards(${accessPolicyGuard})
          testField() {}
        }
      `,
      errors: [
        { messageId: 'graphqlFieldResolversShouldDeclareAccess' },
        { messageId: 'accessPolicyGuardWithoutPolicy' },
      ],
      filename: 'test.tsx',
    })),
    {
      code: `
        @UseGuards(AccessPolicyGuard(VIEW_READ_ACCESS_POLICY))
        class TestResolver {
          @ResolveField(() => String)
          @UseGuards(AccessPolicyGuard(WORKSPACE_MEMBERS_ACCESS_POLICY))
          testField() {}
        }
      `,
      errors: [{ messageId: 'accessPolicyGuardOnClassAndMethod' }],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestResolver {
          @UseGuards(CustomPermissionGuard)
          @ResolveField(() => String)
          @UseGuards(NoPermissionGuard)
          testField() {}
        }
      `,
      errors: [{ messageId: 'stackedUseGuards' }],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(AccessPolicyGuard(VIEW_READ_ACCESS_POLICY))
        class TestResolver {
          @Query()
          testQuery() {}

          @ResolveField(() => String)
          testField() {}
        }
      `,
      errors: [{ messageId: 'classGuardOnRootsAndFieldResolvers' }],
      filename: 'test.tsx',
    },
  ],
});
