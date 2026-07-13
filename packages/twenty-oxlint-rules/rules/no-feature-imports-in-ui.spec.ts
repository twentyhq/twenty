import { fileURLToPath } from 'url';

import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './no-feature-imports-in-ui';

const UI_FILE =
  '/project/packages/twenty-front/src/modules/ui/navigation/navigation-drawer/components/NavigationDrawer.tsx';

const BASELINE_FIXTURE_PATH = fileURLToPath(
  new URL('./no-feature-imports-in-ui.baseline.fixture.json', import.meta.url),
);

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: "import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';",
      filename: UI_FILE,
    },
    {
      code: "import { THEME_LIGHT } from 'twenty-ui/theme';",
      filename: UI_FILE,
    },
    {
      code: "import { isDefined } from 'twenty-shared/utils';",
      filename: UI_FILE,
    },
    {
      code: "import { useState } from 'react';",
      filename: UI_FILE,
    },
    {
      code: "import { NavigationDrawerHeader } from './NavigationDrawerHeader';",
      filename: UI_FILE,
    },
    {
      code: "import { Button } from '@/ui';",
      filename: UI_FILE,
    },
    {
      code: "import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';",
      filename:
        '/project/packages/twenty-front/src/modules/object-record/record-table/components/RecordTable.tsx',
    },
    {
      code: "import { getMockRecord } from '@/object-record/testing/mocks';",
      filename:
        '/project/packages/twenty-front/src/modules/ui/field/display/components/__stories__/ChipDisplay.stories.tsx',
    },
    {
      code: "import { tableWidthResizeIsActiveState } from '@/object-record/record-table/states/tableWidthResizeIsActivedState';",
      filename: UI_FILE,
      options: [
        {
          baselinePath: BASELINE_FIXTURE_PATH,
        },
      ],
    },
  ],
  invalid: [
    {
      code: "import { workspaceState } from '@/workspace/states/workspaceState';",
      filename: UI_FILE,
      errors: [{ messageId: 'featureImportInUi' }],
    },
    {
      code: "import { useQuery } from '@apollo/client';",
      filename: UI_FILE,
      errors: [{ messageId: 'featureImportInUi' }],
    },
    {
      code: "import { SearchRecordsDocument } from '~/generated/graphql';",
      filename: UI_FILE,
      errors: [{ messageId: 'featureImportInUi' }],
    },
    {
      code: "const load = () => import('@/views/components/ViewBar');",
      filename: UI_FILE,
      errors: [{ messageId: 'featureImportInUi' }],
    },
    {
      code: 'const load = () => import(`@/views/components/ViewBar`);',
      filename: UI_FILE,
      errors: [{ messageId: 'featureImportInUi' }],
    },
    {
      code: "import { formatRecord } from '@/ui/../object-record/utils/formatRecord';",
      filename: UI_FILE,
      errors: [{ messageId: 'featureImportInUi' }],
    },
    {
      code: "export { formatRecord } from '@/object-record/utils/formatRecord';",
      filename: UI_FILE,
      errors: [{ messageId: 'featureImportInUi' }],
    },
    {
      code: "import { workspaceState } from '@/workspace/states/workspaceState';",
      filename: UI_FILE,
      options: [
        {
          baselinePath: BASELINE_FIXTURE_PATH,
        },
      ],
      errors: [{ messageId: 'featureImportInUi' }],
    },
  ],
});
