import { TSESLint } from '@typescript-eslint/utils';

import { rule, RULE_NAME } from './rest-api-methods-should-be-guarded';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(UserAuthGuard, NoPermissionGuard)
          testMethod() {}
        }
      `,
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
          testMethod() {}
        }
      `,
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(PublicEndpoint, NoPermissionGuard)
          testMethod() {}
        }
      `,
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(CaptchaGuard, PublicEndpoint, NoPermissionGuard)
          testMethod() {}
        }
      `,
    },
    {
      code: `
        @UseGuards(UserAuthGuard, NoPermissionGuard)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
    },
    {
      code: `
        @UseGuards(PublicEndpoint, NoPermissionGuard)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
    },
    {
      code: `
        class TestController {
          @Post()
          @UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
          createMethod() {}
        }
      `,
    },
    {
      code: `
        class TestController {
          @Put()
          @UseGuards(WorkspaceAuthGuard, UpdatePermissionGuard)
          updateMethod() {}
        }
      `,
    },
    {
      code: `
        class TestController {
          @Patch()
          @UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
          patchMethod() {}
        }
      `,
    },
    {
      code: `
        class TestController {
          @Delete()
          @UseGuards(WorkspaceAuthGuard, DeletePermissionGuard)
          deleteMethod() {}
        }
      `,
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
        class TestController {
          @Post()
          createMethod() {}
        }
      `,
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard, SettingsPermissionsGuard(PermissionFlagType.WORKSPACE))
        class TestController {
          @Delete()
          deleteMethod() {}
        }
      `,
    },
    {
      code: `
        class TestController {
          regularMethod() {}
        }
      `,
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
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(WorkspaceAuthGuard)
          testMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
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
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard)
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
    },
    {
      code: `
        class TestController {
          @Post()
          @UseGuards(WorkspaceAuthGuard)
          createMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
    },
    {
      code: `
        class TestController {
          @Put()
          @UseGuards(WorkspaceAuthGuard)
          updateMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
    },
    {
      code: `
        class TestController {
          @Patch()
          @UseGuards(WorkspaceAuthGuard)
          patchMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
    },
    {
      code: `
        class TestController {
          @Delete()
          @UseGuards(WorkspaceAuthGuard)
          deleteMethod() {}
        }
      `,
      errors: [
        {
          messageId: 'restApiMethodsShouldBeGuarded',
        },
      ],
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard)
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
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard)
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
    },
  ],
});
