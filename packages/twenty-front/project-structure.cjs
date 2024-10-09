/* eslint-disable project-structure/folder-structure */
// @ts-check

const { default: src } = require('afterframe');
const { createFolderStructure } = require('eslint-plugin-project-structure');

module.exports = createFolderStructure({
  longPathsInfo: {
    root: './packages/twenty-front',
    mode: 'warn',
  },
  structure: [
    // Allow any files in the root of your project, like package.json, eslint.config.mjs, etc.
    // You can add rules for them separately.
    // You can also add exceptions like this: "(?!folderStructure)*".
    { name: '*' },
    {
      name: 'packages',
      children: [
        {
          name: 'twenty-front',
          children: [
            {
              name: 'src',
              children: [
                // src/__stories__/App.stories.tsx
                {
                  name: '__stories__',
                  children: [{ name: 'App.stories.tsx' }],
                },
                // src/config/index.ts
                {
                  name: 'config',
                  children: [{ name: 'index.ts' }],
                },
                // src/effect-components
                {
                  name: 'effect-components',
                  children: [{ name: '{StrictPascalCase}Effect.tsx' }],
                },
                // src/generated/graphql.tsx
                {
                  name: 'generated',
                  children: [{ name: 'graphql.tsx' }],
                },
                // src/generated-metadata
                {
                  name: 'generated-metadata',
                  children: [
                    { name: 'gql.ts' },
                    { name: 'graphql.ts' },
                    { name: 'index.ts' },
                  ],
                },
                // src/hooks
                {
                  name: 'hooks',
                  ruleId: 'HooksFolder',
                },
                // src/loading/
                {
                  name: 'loading',
                  children: [
                    // src/loading/components
                    {
                      name: 'components',
                      children: [
                        { name: '{StrictPascalCase}Loader.tsx' },
                        {
                          name: '__stories__',
                          // TODO: should we also include the Loader Suffix here? we have PrefetchLoading.stories in the folder
                          children: [
                            { name: '{StrictPascalCase}.stories.tsx' },
                          ],
                        },
                      ],
                    },
                    // src/loading/__stories__
                    {
                      name: 'hooks',
                      children: [{ name: 'use{StrictPascalCase}.ts' }],
                    },
                  ],
                },
                // src/modules
                {
                  name: 'modules',
                  children: [
                    {
                      name: '{kebab-case}',
                      ruleId: 'ModulesFolder',
                    },
                  ],
                },
                // src/pages
                {
                  name: 'pages',
                  children: [
                    {
                      name: '{kebab-case}',
                      ruleId: 'ComponentFolderWithStories',
                    },
                    {
                      name: 'settings',
                      children: [
                        {
                          name: '{kebab-case}',
                          ruleId: 'ComponentFolderWithStories',
                        },
                        { ruleId: 'StorybookFolder' },
                        // TODO: this is an edge case for ComponentFolderWithStories
                        // This is the only folder that breaks the recursive rule for page/settings
                        {
                          name: 'data-model',
                          children: [
                            { ruleId: 'UtilsFolder' },
                            { ruleId: 'TypesFolder' },
                            { ruleId: 'HooksFolder' },
                            { ruleId: 'ConstantsFolder' },
                            { ruleId: 'StorybookFolder' },
                            {
                              name: 'SettingsObjectNewField',
                              children: [],
                              ruleId: 'ComponentsGroup',
                            },
                            { ruleId: 'ComponentsGroup' },
                          ],
                        },
                        // TODO: Edge case because SettingsCRMMigration is a folder and does not pass on StrictPascalCase
                        // This folder should be able to be passed on ComponentFolderWithStories rule
                        {
                          name: 'crm-migration',
                          children: [{ name: 'SettingsCRMMigration.tsx' }],
                        },
                        { ruleId: 'ComponentsGroup' },
                      ],
                    },
                  ],
                },
                // src/testing
                {
                  name: 'testing',
                  children: [
                    {
                      name: 'constants',
                      ruleId: 'ConstantsFolder',
                    },
                    {
                      name: 'decorators',
                      children: [
                        { name: '{StrictPascalCase}Decorator.tsx' },
                        { name: '{camelCase}Decorator.tsx' },
                      ],
                    },
                    {
                      name: 'hooks',
                      ruleId: 'HooksFolder',
                    },
                    {
                      name: 'jest',
                      children: [
                        { name: '{PascalCase}.tsx' },
                        { name: '{camelCase}.tsx' },
                      ],
                    },
                    {
                      name: 'mock-data',
                      children: [
                        {
                          name: 'generated',
                          children: [{ name: 'mock-{kebab-case}.ts' }],
                        },
                        { name: '{kebab-case}.ts' },
                        { name: '{camelCase}.ts' },
                      ],
                    },
                    {
                      name: 'profiling',
                      children: [
                        {
                          name: 'components',
                          children: [{ name: '{StrictPascalCase}.tsx' }],
                        },
                        { ruleId: 'StatesFolder' },
                        { name: 'constants', ruleId: 'ConstantsFolder' },
                        { name: 'types', ruleId: 'TypesFolder' },
                        { name: 'utils', ruleId: 'UtilsFolder' },
                      ],
                    },
                    {
                      name: '{StrictPascalCase}.tsx',
                    },
                    {
                      name: '{camelCase}.ts',
                    },
                  ],
                },
                // src/types
                {
                  ruleId: 'TypesFolder',
                },
                // src/utils
                { ruleId: 'UtilsFolder' },
                // TODO: is it fine the way we are handling this?
                { name: '{kebab-case}.d.ts' },
                { name: 'index.css' },
                { name: 'index.tsx' },
                { name: 'App.tsx' },
                { name: 'SettingsRoutes.tsx' },
              ],
            },
            {
              name: '__mocks__',
              children: [{ name: 'hex-rgb.js' }, { name: '{camelCase}.js' }],
            },
            {
              name: '.storybook',
              children: [{ name: '{kebab-case}.(ts|html|tsx|js)' }],
            },
            {
              name: 'public',
              children: [
                {
                  name: '{kebab-case|PascalCase}',
                  ruleId: 'ImagesFolder',
                },
                { name: 'env-config.js' },
                { name: 'manifest.json' },
                { name: 'mockServiceWorker.js' },
              ],
            },
            {
              name: 'script',
              children: [{ name: '{kebab-case}.sh' }],
            },
            { name: '*' },
          ],
        },
      ],
    },
  ],
  rules: {
    StorybookFolder: {
      name: '__stories__',
      children: [
        { name: '{StrictPascalCase}', ruleId: 'StorybookFolder' },
        { name: '{StrictPascalCase}.tsx' },
        { name: '{StrictPascalCase}.stories.tsx' },
        { name: '{StrictPascalCase}.perf.stories.tsx' },
        { name: '{camelCase}.ts' },
        { name: '{PascalCase}.tsx' },

        // TODO: this is a edge case for
        /* 
        - /src/pages/settings/developers/__stories__/api-keys
        - /src/pages/settings/developers/__stories__/webhooks 
        */
        // should we enforce StrictPascalCase?
        { name: '{kebab-case}', ruleId: 'StorybookFolder' },
      ],
    },
    ComponentsGroup: { name: '{StrictPascalCase}.tsx' },
    ComponentFolderWithStories: {
      children: [
        { ruleId: 'StorybookFolder' },
        { name: '{StrictPascalCase}.tsx' },
        { name: '{camelCase}.ts' },
        { name: '{kebab-case}.ts' },
        { name: '{kebab-case}', ruleId: 'ComponentFolderWithStories' },
      ],
    },
    UtilsFolder: {
      name: 'utils',
      children: [
        // TODO: what is the correct rule for utils?
        {
          name: '__tests__',
          children: [
            { name: '{kebab-case}(.utils)?.test.ts' },
            { name: '{PascalCase}(.utils)?.test.ts' },
            { name: '{camelCase}(.utils)?.test.ts' },
          ],
        },
        {
          name: '__test__',
          children: [
            { name: '{kebab-case}(.utils)?.test.ts' },
            { name: '{PascalCase}(.utils)?.test.ts' },
            { name: '{camelCase}(.utils)?.test.ts' },
          ],
        },
        { name: '{kebab-case}(.utils)?.ts' },
        { name: '{kebab-case}(.util)?.ts' },
        { name: '{PascalCase}(.utils)?.ts' },
        { name: '{camelCase}(.utils)?.ts' },
        { name: '{camelCase}.spec.ts' },
        { name: '{camelCase}.(ts|tsx)' },
        { name: '{kebab-case}', ruleId: 'UtilsFolder' },
      ],
    },
    TypesFolder: {
      name: 'types',
      children: [
        { name: '{StrictPascalCase}.(ts|tsx)' },
        { name: '{camelCase}.(ts|tsx)' },
        { name: '{camelCase}.interface.ts' },
        { name: '{kebab-case}.(ts|tsx)' },
        { name: '{kebab-case}', ruleId: 'TypesFolder' },
      ],
    },
    HooksFolder: {
      name: 'hooks',
      children: [
        { name: 'use{StrictPascalCase}.(ts|tsx)' },
        { name: 'use{PascalCase}.(ts|tsx)' },

        {
          name: '__tests__',
          children: [
            { name: 'use{StrictPascalCase}.test.(ts|tsx)' },
            { name: 'use{PascalCase}.test.(ts|tsx)' },
          ],
        },
        {
          name: '__test__',
          children: [{ name: 'use{StrictPascalCase}.test.(ts|tsx)' }],
        },
        {
          ruleId: 'MocksFolder',
        },
        {
          name: '{kebab-case}',
          children: [{ name: '{camelCase}.(ts|tsx)' }],
        },
      ],
    },
    ConstantsFolder: {
      name: 'constants',
      children: [{ name: '{StrictPascalCase}.ts' }],
    },
    ImagesFolder: {
      name: '{kebab-case|PascalCase|snake_case}.(png|svg)',
    },
    ServicesFolder: {
      name: 'services',
      children: [
        {
          name: '__tests__',
          children: [
            { name: '{camelCase}.factory.test.ts' },
            { name: '{PascalCase}.test.ts' },
          ],
        },
        { name: '{camelCase}.factory.ts' },
        { name: '{StrictPascalCase}.ts' },
      ],
    },
    StatesFolder: {
      name: 'states',
      children: [
        { name: '{camelCase}.ts' },
        {
          name: '{kebab-case}',
          children: [{ name: '{camelCase}.ts' }, { name: '{PascalCase}.ts' }],
        },
      ],
    },
    assetsFolder: {
      name: 'assets',
      children: [{ name: '{kebab-case|PascalCase|snake_case}.(png|svg)' }],
    },
    ScopeFolder: {
      name: 'scopes',
      children: [
        { name: '{kebab-case}', children: [{ name: '{PascalCase}.(ts|tsx)' }] },
        { name: '{PascalCase}.(ts|tsx)' },
      ],
    },
    MocksFolder: {
      name: '__mocks__',
      children: [
        { name: '{camelCase}.(ts|tsx)' },
        { name: '{PascalCase}.(ts|tsx)' },
      ],
    },
    ThemesFolder: {
      name: 'theme',
      children: [{ name: '{PascalCase}.(ts|tsx)' }],
    },
    TestFolder: {
      name: 'tests',
      children: [
        {
          name: '{camelCase}.(ts|tsx)',
        },
      ],
    },
    TestsFolder: {
      name: '__tests__',
      children: [
        { name: '{kebab-case}(.utils)?.test.ts' },
        { name: '{PascalCase}(.utils)?.test.ts' },
        { name: '{camelCase}(.utils)?.test.ts' },
      ],
    },
    EnumsFolder: {
      name: 'enums',
      children: [{ name: '{StrictPascalCase}.enum.ts' }],
    },
    ModulesFolder: {
      name: 'modules',
      children: [
        { ruleId: 'ComponentFolderWithStories' },
        { ruleId: 'HooksFolder' },
        { ruleId: 'ConstantsFolder' },
        { ruleId: 'TypesFolder' },
        { ruleId: 'UtilsFolder' },
        { ruleId: 'StatesFolder' },
        { ruleId: 'assetsFolder' },
        { ruleId: 'ScopeFolder' },
        { ruleId: 'ServicesFolder' },
        { ruleId: 'MocksFolder' },
        { ruleId: 'ThemesFolder' },
        { ruleId: 'TestsFolder' },
        { ruleId: 'TestFolder' },
        { ruleId: 'StorybookFolder' },
        { ruleId: 'EnumsFolder' },
        { name: 'context', children: [{ name: 'StrictPascalCase' }] },
        {
          name: 'graphql',
          children: [
            {
              name: '{kebab-case}',
              children: [
                { name: '{camelCase}.ts' },
                { name: '{StrictPascalCase}.ts' },
                {
                  name: '{kebab-case}',
                  children: [
                    { name: '{camelCase}.ts' },
                    { name: '{StrictPascalCase}.ts' },
                  ],
                },
              ],
            },
            { name: '{camelCase}.ts' },
            { ruleId: 'TypesFolder' },
            { ruleId: 'UtilsFolder' },
          ],
        },
        {
          name: 'queries',
          children: [
            { name: '{camelCase}.ts' },
            {
              name: '{kebab-case}',
              children: [{ name: '{camelCase}.ts' }],
            },
            { ruleId: 'TestsFolder' },
          ],
        },
        { name: '{StrictPascalCase}.(ts|tsx)' },
        { name: '{PascalCase}.(ts|tsx)' },
        { name: '{camelCase}.(ts|tsx)' },
        {
          name: '{kebab-case}',
          ruleId: 'ModulesFolder',
        },
      ],
    },
  },
});
