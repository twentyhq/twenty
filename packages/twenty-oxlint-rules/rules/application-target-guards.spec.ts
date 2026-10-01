import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './application-target-guards';

const PRINCIPAL_GUARD =
  'AuthPrincipalGuard({ userSession: true, apiKey: true, oauthClient: true, application: true })';

const targetArg = (requireApplicationRegistrationOwnership: string) =>
  `@ApplicationTargetArg('id', { kind: 'applicationRegistrationId', requireApplicationRegistrationOwnership: ${requireApplicationRegistrationOwnership} }) id: string`;

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(${PRINCIPAL_GUARD}, SettingsPermissionGuard(PermissionFlagType.APPLICATIONS), ApplicationTargetGuard, ApplicationRegistrationOwnershipGuard)
          testQuery(${targetArg('true')}) {}
        }
      `,
      filename: 'test.ts',
    },
    {
      code: `
        @UseGuards(${PRINCIPAL_GUARD}, NoPermissionGuard)
        class TestResolver {
          @Mutation()
          @UseGuards(ApplicationTargetGuard)
          testMutation(${targetArg('false')}) {}
        }
      `,
      filename: 'test.ts',
    },
    {
      code: `
        class TestResolver {
          @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS), ApplicationTargetGuard)
          @Query()
          @UseGuards(${PRINCIPAL_GUARD})
          testQuery(${targetArg('false')}) {}
        }
      `,
      filename: 'test.ts',
    },
    {
      code: `
        class TestController {
          @Get(':applicationId')
          @UseGuards(NoPermissionGuard, ApplicationTargetGuard)
          getAsset(@ApplicationTargetParam('applicationId', { kind: 'applicationId', requireApplicationRegistrationOwnership: false }) applicationId: string) {}
        }
      `,
      filename: 'test.ts',
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(${PRINCIPAL_GUARD}, NoPermissionGuard)
          testQuery(@Args('id') id: string) {}
        }
      `,
      filename: 'test.ts',
    },
    {
      code: `
        class TestResolver {
          helper(${targetArg('true')}) {}
        }
      `,
      filename: 'test.ts',
    },
  ],
  invalid: [
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(${PRINCIPAL_GUARD}, NoPermissionGuard)
          testQuery(${targetArg('false')}) {}
        }
      `,
      filename: 'test.ts',
      errors: [{ messageId: 'missingTargetGuards' }],
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(${PRINCIPAL_GUARD}, NoPermissionGuard, ApplicationTargetGuard)
          testQuery(${targetArg('true')}) {}
        }
      `,
      filename: 'test.ts',
      errors: [{ messageId: 'missingTargetGuards' }],
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(${PRINCIPAL_GUARD}, NoPermissionGuard, ApplicationTargetGuard, ApplicationRegistrationOwnershipGuard)
          testQuery(${targetArg('false')}) {}
        }
      `,
      filename: 'test.ts',
      errors: [{ messageId: 'ownershipGuardWithoutFlag' }],
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(${PRINCIPAL_GUARD}, ApplicationTargetGuard, NoPermissionGuard)
          testQuery(${targetArg('false')}) {}
        }
      `,
      filename: 'test.ts',
      errors: [{ messageId: 'targetGuardsNotLast' }],
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(${PRINCIPAL_GUARD}, NoPermissionGuard, ApplicationRegistrationOwnershipGuard, ApplicationTargetGuard)
          testQuery(${targetArg('true')}) {}
        }
      `,
      filename: 'test.ts',
      errors: [{ messageId: 'targetGuardsNotLast' }],
    },
    {
      code: `
        class TestResolver {
          @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
          @Query()
          @UseGuards(${PRINCIPAL_GUARD}, ApplicationTargetGuard)
          testQuery(${targetArg('false')}) {}
        }
      `,
      filename: 'test.ts',
      errors: [{ messageId: 'targetGuardsNotLast' }],
    },
    {
      code: `
        @UseGuards(${PRINCIPAL_GUARD}, NoPermissionGuard, ApplicationTargetGuard)
        class TestResolver {
          @Query()
          testQuery(${targetArg('false')}) {}
        }
      `,
      filename: 'test.ts',
      errors: [
        { messageId: 'targetGuardOnClass' },
        { messageId: 'missingTargetGuards' },
      ],
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(${PRINCIPAL_GUARD}, NoPermissionGuard, ApplicationTargetGuard)
          testQuery(@Args('id') id: string) {}
        }
      `,
      filename: 'test.ts',
      errors: [{ messageId: 'guardWithoutTarget' }],
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(${PRINCIPAL_GUARD}, NoPermissionGuard, ApplicationTargetGuard)
          testQuery(${targetArg('requiresOwnership')}) {}
        }
      `,
      filename: 'test.ts',
      errors: [{ messageId: 'ownershipFlagNotInline' }],
    },
  ],
});
