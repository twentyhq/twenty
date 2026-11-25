import { RuleTester } from 'oxlint/plugins-dev';

import { AUTHENTICATING_GUARD_NAMES } from '../utils/typedTokenHelpers';
import { rule, RULE_NAME } from './rest-api-methods-should-be-guarded';

const ACCEPT_EVERY_PRINCIPAL =
  'AccessPolicyGuard({ authPrincipals: { userSession: true, apiKey: true, oauthClient: true, application: true }, requiredPermissionFlags: [] })';

const ACCEPT_USER_SESSIONS =
  'AccessPolicyGuard({ authPrincipals: { userSession: true, apiKey: false, oauthClient: false, application: false }, requiredPermissionFlags: [PermissionFlagType.ROLES] })';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        @UseGuards(JwtAuthGuard)
        class TestController {
          @Post()
          @UseGuards(AccessPolicyGuard(WEBHOOK_WRITE_ACCESS_POLICY))
          create() {}
        }
      `,
      filename: 'test.ts',
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(${ACCEPT_USER_SESSIONS})
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
        @UseGuards(PublicEndpointGuard, NoPermissionGuard)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    ...['Post', 'Put', 'Patch', 'Delete'].map((methodDecorator) => ({
      code: `
        class TestController {
          @${methodDecorator}()
          @UseGuards(${ACCEPT_EVERY_PRINCIPAL}, CustomPermissionGuard)
          testMethod() {}
        }
      `,
      filename: 'test.tsx',
    })),
    {
      code: `
        class TestController {
          regularMethod() {}
        }
      `,
    },
    ...['FileByIdGuard', 'FileUploadTokenGuard', 'FilePathGuard'].map(
      (fileTokenGuard) => ({
        code: `
        class TestController {
          @Get()
          @UseGuards(${fileTokenGuard}, NoPermissionGuard)
          testMethod() {}
        }
      `,
        filename: 'test.tsx',
      }),
    ),
    ...AUTHENTICATING_GUARD_NAMES.map((authenticatingGuardName) => ({
      code: `
        @UseGuards(
          ${authenticatingGuardName},
          ${ACCEPT_EVERY_PRINCIPAL},
          WorkspaceNotSuspendedGuard,
        )
        class TestController {
          @Post()
          createMethod() {}
        }
      `,
      filename: 'test.tsx',
    })),
  ],
  invalid: [
    ...['Get', 'Post'].map((methodDecorator) => ({
      code: `
        class TestController {
          @${methodDecorator}()
          testMethod() {}
        }
      `,
      errors: [{ messageId: 'restApiMethodsShouldBeGuarded' }],
      filename: 'test.tsx',
    })),
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(CaptchaGuard)
          testMethod() {}
        }
      `,
      errors: [{ messageId: 'restApiMethodsShouldBeGuarded' }],
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
      errors: [{ messageId: 'restApiMethodsShouldBeGuarded' }],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Delete()
          @UseGuards(DeletePermissionGuard)
          deleteMethod() {}
        }
      `,
      errors: [{ messageId: 'restApiMethodsShouldBeGuarded' }],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(JwtAuthGuard, AuthPrincipalGuard({ userSession: true, apiKey: true, oauthClient: true, application: true }), NoPermissionGuard)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
      errors: [{ messageId: 'restApiMethodsShouldBeGuarded' }],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Post()
          @UseGuards(AccessPolicyGuard(WEBHOOK_POLICY))
          createMethod() {}
        }
      `,
      errors: [
        { messageId: 'restApiMethodsShouldBeGuarded' },
        { messageId: 'accessPolicyGuardWithoutPolicy' },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Post()
          @UseGuards(CaptchaGuard)
          @UseGuards(${ACCEPT_USER_SESSIONS})
          createMethod() {}
        }
      `,
      errors: [{ messageId: 'stackedUseGuards' }],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(JwtAuthGuard, WorkspaceNotSuspendedGuard)
        class TestController {
          @Get()
          @UseGuards(${ACCEPT_USER_SESSIONS})
          testMethod() {}
        }
      `,
      errors: [{ messageId: 'classGuardBeforeMethodAccessPolicy' }],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(JwtAuthGuard, WorkspaceNotSuspendedGuard, ${ACCEPT_EVERY_PRINCIPAL})
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
      errors: [{ messageId: 'accessPolicyGuardNotFirst' }],
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Post()
          @UseGuards(CaptchaGuard, ${ACCEPT_USER_SESSIONS})
          createMethod() {}
        }
      `,
      errors: [{ messageId: 'accessPolicyGuardNotFirst' }],
      filename: 'test.tsx',
    },
  ],
});
