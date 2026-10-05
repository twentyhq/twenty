import { RuleTester } from 'oxlint/plugins-dev';

import { AUTHENTICATING_GUARD_NAMES } from '../utils/typedTokenHelpers';
import { rule, RULE_NAME } from './rest-api-methods-should-be-guarded';

const ACCEPT_EVERY_PRINCIPAL =
  'AuthPrincipalGuard({ userSession: true, apiKey: true, oauthClient: true, application: true })';

const ACCEPT_USER_SESSIONS =
  'AuthPrincipalGuard({ userSession: true, apiKey: false, oauthClient: false, application: false })';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(${ACCEPT_USER_SESSIONS}, NoPermissionGuard)
          testMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, CustomPermissionGuard)
          testMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(PublicEndpointGuard, NoPermissionGuard)
          testMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(CaptchaGuard, PublicEndpointGuard, NoPermissionGuard)
          testMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(${ACCEPT_USER_SESSIONS}, NoPermissionGuard)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, CustomPermissionGuard)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(PublicEndpointGuard, NoPermissionGuard)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Post()
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, CustomPermissionGuard)
          createMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Put()
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, UpdatePermissionGuard)
          updateMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Patch()
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, NoPermissionGuard)
          patchMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Delete()
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, DeletePermissionGuard)
          deleteMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, CustomPermissionGuard)
        class TestController {
          @Post()
          createMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, SettingsPermissionGuard(PermissionFlagType.WORKSPACE))
        class TestController {
          @Delete()
          deleteMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          regularMethod() {}
        }
      `,
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(FileByIdGuard, NoPermissionGuard)
          testMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(ServerFileByIdGuard, NoPermissionGuard)
          testMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Post()
          @UseGuards(FileUploadTokenGuard, NoPermissionGuard)
          testMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(FilePathGuard, NoPermissionGuard)
          testMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    ...AUTHENTICATING_GUARD_NAMES.map((authenticatingGuardName) => ({
      code: `
        @UseGuards(
          ${authenticatingGuardName},
          ${ACCEPT_EVERY_PRINCIPAL},
          WorkspaceNotSuspendedGuard,
          NoPermissionGuard,
        )
        class TestController {
          @Post()
          createMethod() {}
        }
      `,
      filename: 'test.tsx',
    })),
    {
      code: `
        @UseGuards(JwtAuthGuard, ${ACCEPT_EVERY_PRINCIPAL}, NoPermissionGuard)
        class TestController {
          @Post()
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
            SettingsPermissionGuard(PermissionFlagType.ROLES),
          )
          createMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
  ],
  invalid: [
    {
      code: `
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Post()
          testMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL})
          testMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(CaptchaGuard)
          testMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(CaptchaGuard)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(${ACCEPT_EVERY_PRINCIPAL})
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Post()
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL})
          createMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Put()
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL})
          updateMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Patch()
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL})
          patchMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Delete()
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL})
          deleteMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(${ACCEPT_EVERY_PRINCIPAL})
        class TestController {
          @Post()
          createMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(${ACCEPT_EVERY_PRINCIPAL})
        class TestController {
          @Delete()
          deleteMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
      filename: 'test.tsx',
    },
    ...[
      'AuthPrincipalGuard(AUTH_PRINCIPAL_GUARD_CONFIG)',
      'AuthPrincipalGuard({ ...USER_SESSIONS_ONLY, apiKey: true })',
      'AuthPrincipalGuard({ userSession: USER_SESSION_VARIANTS, apiKey: false, oauthClient: false, application: false })',
      'AuthPrincipalGuard({ userSession, apiKey: false, oauthClient: false, application: false })',
    ].map((authPrincipalGuard) => ({
      code: `
        class TestController {
          @Get()
          @UseGuards(${authPrincipalGuard}, NoPermissionGuard)
          testMethod() {}
        }
      `,
      errors: [
        { messageId: 'restApiMethodsShouldBeGuarded' },
        { messageId: 'authPrincipalGuardConfigNotInline' },
      ],
      filename: 'test.tsx',
    })),
    {
      code: `
        @UseGuards(
          JwtAuthGuard,
          AuthPrincipalGuard({
            userSession: {
              standard: true,
              impersonated: true,
              playground: true,
              workspaceAgnostic: false,
            },
            apiKey: true,
            oauthClient: { withUser: true, withoutUser: false },
            application: { withUser: true, withoutUser: false },
          }),
          NoPermissionGuard,
        )
        class TestController {
          @Get()
          @UseGuards(
            AuthPrincipalGuard({
              userSession: true,
              apiKey: false,
              oauthClient: true,
              application: { withUser: true, withoutUser: false },
            }),
          )
          testMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'authPrincipalGuardWiderThanClass',
          data: {
            principalVariants:
              'userSession.workspaceAgnostic, oauthClient.withoutUser',
          },
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(JwtAuthGuard, WorkspaceNotSuspendedGuard, ${ACCEPT_EVERY_PRINCIPAL}, NoPermissionGuard)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
      errors: [{ messageId: 'authPrincipalGuardNotFirst' }],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Post()
          @UseGuards(CaptchaGuard, ${ACCEPT_USER_SESSIONS}, NoPermissionGuard)
          createMethod() {}
        }
      `,
      errors: [{ messageId: 'authPrincipalGuardNotFirst' }],
      filename: 'test.tsx',
    },
  ],
});
