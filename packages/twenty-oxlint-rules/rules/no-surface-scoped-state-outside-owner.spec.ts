import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './no-surface-scoped-state-outside-owner';

const ruleTester = new RuleTester();

const OPTIONS = [
  {
    restrictedStates: [
      {
        importPath: '@/ui/layout/dropdown/states/isDropdownOpenComponentState',
        ownerModulePath: 'src/modules/ui/layout/dropdown/',
        useInstead: 'useIsDropdownOpen',
      },
    ],
  },
];

const IMPORT_STATE =
  "import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';";

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: IMPORT_STATE,
      filename:
        '/project/packages/twenty-front/src/modules/ui/layout/dropdown/hooks/useIsDropdownOpen.ts',
      options: OPTIONS,
    },
    {
      code: "import { useIsDropdownOpen } from '@/ui/layout/dropdown/hooks/useIsDropdownOpen';",
      filename:
        '/project/packages/twenty-front/src/modules/views/components/ViewBarFilterButton.tsx',
      options: OPTIONS,
    },
    {
      code: IMPORT_STATE,
      filename:
        '/project/packages/twenty-front/src/modules/views/components/ViewBarFilterButton.tsx',
    },
  ],
  invalid: [
    {
      code: IMPORT_STATE,
      filename:
        '/project/packages/twenty-front/src/modules/views/components/ViewBarFilterButton.tsx',
      options: OPTIONS,
      errors: [
        {
          messageId: 'useOwnerHook',
          data: {
            stateName: 'isDropdownOpenComponentState',
            useInstead: 'useIsDropdownOpen',
          },
        },
      ],
    },
  ],
});
