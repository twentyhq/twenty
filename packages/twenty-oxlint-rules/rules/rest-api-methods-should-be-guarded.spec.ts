import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './rest-api-methods-should-be-guarded';

const ruleTester = new RuleTester();

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
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Get()
          @UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
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
        @UseGuards(UserAuthGuard, NoPermissionGuard)
        class TestController {
          @Get()
          testMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
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
          @UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
          createMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Put()
          @UseGuards(WorkspaceAuthGuard, UpdatePermissionGuard)
          updateMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Patch()
          @UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
          patchMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        class TestController {
          @Delete()
          @UseGuards(WorkspaceAuthGuard, DeletePermissionGuard)
          deleteMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
        class TestController {
          @Post()
          createMethod() {}
        }
      `,
      filename: 'test.tsx',
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard, SettingsPermissionGuard(PermissionFlagType.WORKSPACE))
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
          @UseGuards(WorkspaceAuthGuard)
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
      filename: 'test.tsx',
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
      filename: 'test.tsx',
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
      filename: 'test.tsx',
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
      filename: 'test.tsx',
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
      filename: 'test.tsx',
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
      filename: 'test.tsx',
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
      filename: 'test.tsx',
    },
  ],
});
