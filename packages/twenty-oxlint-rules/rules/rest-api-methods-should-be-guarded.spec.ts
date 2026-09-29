import { RuleTester } from 'oxlint/plugins-dev';

import { REPLACED_CALLER_GUARD_NAMES } from '../utils/typedTokenHelpers';
import { rule, RULE_NAME } from './rest-api-methods-should-be-guarded';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(CallerGuard({ userSession: true }), NoPermissionGuard)
          testMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(CallerGuard({ userSession: true, apiKey: true }), CustomPermissionGuard)
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
        @UseGuards(CallerGuard({ userSession: true }), NoPermissionGuard)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(CallerGuard({ userSession: true, apiKey: true }), CustomPermissionGuard)
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
          @UseGuards(CallerGuard({ userSession: true, apiKey: true }), CustomPermissionGuard)
          createMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Put()
          @UseGuards(CallerGuard({ userSession: true, apiKey: true }), UpdatePermissionGuard)
          updateMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Patch()
          @UseGuards(CallerGuard({ userSession: true, apiKey: true }), NoPermissionGuard)
          patchMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Delete()
          @UseGuards(CallerGuard({ userSession: true, apiKey: true }), DeletePermissionGuard)
          deleteMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(CallerGuard({ userSession: true, apiKey: true }), CustomPermissionGuard)
        class TestController {
          @Post()
          createMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(CallerGuard({ userSession: true, apiKey: true }), SettingsPermissionGuard(PermissionFlagType.WORKSPACE))
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
          @Post()
          @UseGuards(
            CallerGuard({ userSession: { playground: false } }),
            SettingsPermissionGuard(PermissionFlagType.ROLES),
          )
          createMethod() {}
        }
      `,
      filename: 'test.tsx',
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
          @Post()
          @UseGuards(FileUploadTokenGuard, NoPermissionGuard)
          testMethod() {}
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
        class TestController {
          @Get()
          @UseGuards(CallerGuard({ userSession: { impersonation: false } }))
          testMethod() {}
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
        class TestController {
          @Get()
          @UseGuards(CallerGuard({ apiKey: true, oauthClient: true }))
          testMethod() {}
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
          @UseGuards(CallerGuard({ userSession: true, apiKey: true }))
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
        @UseGuards(CallerGuard({ userSession: true, apiKey: true }))
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
          @UseGuards(CallerGuard({ userSession: true, apiKey: true }))
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
          @UseGuards(CallerGuard({ userSession: true, apiKey: true }))
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
          @UseGuards(CallerGuard({ userSession: true, apiKey: true }))
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
          @UseGuards(CallerGuard({ userSession: true, apiKey: true }))
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
        @UseGuards(CallerGuard({ userSession: true, apiKey: true }))
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
        @UseGuards(CallerGuard({ userSession: true, apiKey: true }))
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
    ...REPLACED_CALLER_GUARD_NAMES.map((guardName) => ({
      code: `
        class TestController {
          @Get()
          @UseGuards(${guardName}, NoPermissionGuard)
          testMethod() {}
        }
      `,
      errors: [
        { messageId: 'restApiMethodsShouldBeGuarded' },
        { messageId: 'replacedCallerGuard', data: { guardName } },
      ],
      filename: 'test.tsx',
    })),
    {
      code: `
        @UseGuards(JwtAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'replacedCallerGuard',
          data: { guardName: 'WorkspaceAuthGuard' },
        },
        { messageId: 'restApiMethodsShouldBeGuarded' },
      ],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(CallerGuard({ userSession: true }), NoPermissionGuard)
        class TestController {
          @Delete()
          @UseGuards(RequireAccessTokenGuard)
          deleteMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'replacedCallerGuard',
          data: { guardName: 'RequireAccessTokenGuard' },
        },
      ],
      filename: 'test.tsx',
    },
    ...[
      'CallerGuard(CALLER_GUARD_CONFIG)',
      'CallerGuard({ ...USER_SESSION_ONLY, apiKey: true })',
      'CallerGuard({ userSession: USER_SESSION_OPTIONS })',
    ].map((callerGuard) => ({
      code: `
        class TestController {
          @Get()
          @UseGuards(${callerGuard}, NoPermissionGuard)
          testMethod() {}
        }
      `,
      errors: [
        { messageId: 'restApiMethodsShouldBeGuarded' },
        { messageId: 'callerGuardConfigNotInline' },
      ],
      filename: 'test.tsx',
    })),
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(CallerGuard({}), NoPermissionGuard)
          testMethod() {}
        }
      `,
      errors: [{ messageId: 'callerGuardAcceptsNoCaller' }],
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(CallerGuard({ apiKey: true }), NoPermissionGuard)
        class TestController {
          @Get()
          @UseGuards(CallerGuard({ userSession: true }))
          testMethod() {}
        }
      `,
      errors: [{ messageId: 'callerGuardsShareNoCaller' }],
      filename: 'test.tsx',
    },
  ],
});
