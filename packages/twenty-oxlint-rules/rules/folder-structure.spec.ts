import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './folder-structure';

const ruleTester = new RuleTester();

const DUMMY_CODE = 'const x = 1;';
const PROJECT = '/project/packages/twenty-front';

const filename = (path: string) => `${PROJECT}/${path}`;

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // Files outside src/modules/ are ignored
    {
      code: DUMMY_CODE,
      filename: filename('src/utils/helper.ts'),
    },
    {
      code: DUMMY_CODE,
      filename: filename('src/components/Button.tsx'),
    },

    // types/ root folder allows anything
    {
      code: DUMMY_CODE,
      filename: filename('src/modules/types/global.d.ts'),
    },
    {
      code: DUMMY_CODE,
      filename: filename('src/modules/types/nested/deep.ts'),
    },

    // Hooks: use{PascalCase}.(ts|tsx)
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/hooks/useCreateOneRecord.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/hooks/useMyHook.tsx',
      ),
    },

    // Hook tests: use{PascalCase}.(test|spec).(ts|tsx)
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/hooks/__tests__/useCreateOneRecord.test.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/hooks/__tests__/useMyHook.test.tsx',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/hooks/__tests__/useMyHook.spec.tsx',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/hooks/__tests__/__snapshots__/snap.ts',
      ),
    },

    // Hooks internal
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/hooks/internal/useInternalHook.ts',
      ),
    },

    // Hooks __mocks__
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/hooks/__mocks__/useMyHook.ts',
      ),
    },

    // Utils: {camelCase}.(ts|tsx)
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/utils/buildQuery.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/utils/getCardComponent.tsx',
      ),
    },

    // Util tests: {camelCase}.(test|spec).(ts|tsx)
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/utils/__tests__/buildQuery.test.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/utils/__tests__/buildQuery.spec.ts',
      ),
    },

    // Utils kebab-case subfolders (leaf directories)
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/workflow/utils/cron-to-human/parseCron.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/workflow/utils/cron-to-human/types/CronParts.ts',
      ),
    },

    // Standard allowed subdirs
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/components/RecordTable.tsx',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/states/someState.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/constants/DEFAULT_VALUE.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/graphql/queries.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/effect-components/MyEffect.tsx',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/validation-schemas/schema.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/contexts/MyContext.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/scopes/MyScope.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/services/recordService.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/errors/NotFoundError.ts',
      ),
    },

    // Nested modules up to depth 4
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/my-feature/sub-module/components/Widget.tsx',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename('src/modules/a/b/c/d/hooks/useDeep.ts'),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/a/b/c/d/e/hooks/useDeep.ts',
      ),
    },

    // Files directly in module folders
    {
      code: DUMMY_CODE,
      filename: filename('src/modules/my-feature/index.ts'),
    },

    // __tests__ inside module
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/object-record/__tests__/integration.test.ts',
      ),
    },

    // Test helpers and non-standard files in __tests__/ are allowed (leaf context)
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/my-feature/hooks/__tests__/TestWrapper.tsx',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/my-feature/hooks/__tests__/constants/mockData.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/my-feature/utils/__tests__/helpers/setup.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/my-feature/utils/__tests__/kebab-name.test.js',
      ),
    },
  ],

  invalid: [
    // Files directly in modules root
    {
      code: DUMMY_CODE,
      filename: filename('src/modules/loose-file.ts'),
      errors: [{ messageId: 'noFilesInModulesRoot' }],
    },

    // Non-kebab-case module names
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/MyModule/hooks/useHook.ts',
      ),
      errors: [{ messageId: 'moduleNameNotKebabCase' }],
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/camelCase/hooks/useHook.ts',
      ),
      errors: [{ messageId: 'moduleNameNotKebabCase' }],
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/my-feature/graphWidgetChart/file.ts',
      ),
      errors: [{ messageId: 'moduleNameNotKebabCase' }],
    },

    // Module nesting too deep (depth > 5)
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/a/b/c/d/e/f/hooks/useDeep.ts',
      ),
      errors: [{ messageId: 'moduleTooDeep' }],
    },
    // Depth check fires before kebab-case check at max depth
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/a/b/c/d/e/camelCaseDir/file.ts',
      ),
      errors: [{ messageId: 'moduleTooDeep' }],
    },

    // Bad hook file naming
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/my-feature/hooks/badName.ts',
      ),
      errors: [{ messageId: 'hookFileNaming' }],
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/my-feature/hooks/helper.ts',
      ),
      errors: [{ messageId: 'hookFileNaming' }],
    },

    // Invalid hooks folder entry
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/my-feature/hooks/random-folder/file.ts',
      ),
      errors: [{ messageId: 'invalidHooksEntry' }],
    },

    // Bad util file naming (PascalCase not allowed)
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/my-feature/utils/BadName.ts',
      ),
      errors: [{ messageId: 'utilFileNaming' }],
    },
    // Bad util file naming (kebab-case files not allowed)
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/my-feature/utils/kebab-name.ts',
      ),
      errors: [{ messageId: 'utilFileNaming' }],
    },

    // Non-kebab-case subfolder in utils
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/my-feature/utils/camelCase/file.ts',
      ),
      errors: [{ messageId: 'invalidUtilsEntry' }],
    },

    // hooks/internal/ too deep
    {
      code: DUMMY_CODE,
      filename: filename(
        'src/modules/my-feature/hooks/internal/internal/internal/useHook.ts',
      ),
      errors: [{ messageId: 'hooksInternalTooDeep' }],
    },
  ],
});
