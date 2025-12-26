import js from '@eslint/js';
import nxPlugin from '@nx/eslint-plugin';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import linguiPlugin from 'eslint-plugin-lingui';
import preferArrowPlugin from 'eslint-plugin-prefer-arrow';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import unicornPlugin from 'eslint-plugin-unicorn';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import jsoncParser from 'jsonc-eslint-parser';

export default [
  // Base JavaScript configuration
  js.configs.recommended,

  // Lingui recommended rules
  linguiPlugin.configs['flat/recommended'],

  // Base configuration for all files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
      'prettier': prettierPlugin,
      'lingui': linguiPlugin,
      '@nx': nxPlugin,
      'prefer-arrow': preferArrowPlugin,
      'import': importPlugin,
      'unused-imports': unusedImportsPlugin,
      'unicorn': unicornPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // General rules
      'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
      'no-console': ['warn', { allow: ['group', 'groupCollapsed', 'groupEnd'] }],
      'no-control-regex': 0,
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'prettier/prettier': 'error',

      // Nx rules
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:backend',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:backend'],
            },
            {
              sourceTag: 'scope:frontend',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:frontend'],
            },
            {
              sourceTag: 'scope:zapier',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
          ],
        },
      ],

      // Import rules
      'import/no-relative-packages': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-duplicates': ['error', { considerQueryString: true }],

      // Prefer arrow functions
      'prefer-arrow/prefer-arrow-functions': [
        'error',
        {
          disallowPrototype: true,
          singleReturnOnly: false,
          classPropertiesAllowed: false,
        },
      ],

      // Unused imports
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // React rules
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
      'react/jsx-key': 'off',
      'react/display-name': 'off',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-useless-fragment': 'off',
      'react/jsx-props-no-spreading': [
        'error',
        {
          explicitSpread: 'ignore',
        },
      ],

      // React hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': [
        'warn',
        {
          additionalHooks: 'useRecoilCallback',
        },
      ],
      // Lingui - detect untranslated strings
      'lingui/no-unlocalized-strings': [
        'error',
        {
          ignore: [
            // Ignore strings which are a single "word" (no spaces) and don't start with uppercase
            '^(?![A-Z])\\S+$',
            // Ignore UPPERCASE literals (constants, env vars)
            '^[A-Z0-9_-]+$',
            // Ignore strings that look like code/technical (contain special chars)
            '^[\\s]*$', // whitespace only
            '.*[{}/<>].*', // contains code-like characters
            '^\\d+(\\.\\d+)?(px|rem|em|%|vh|vw|s|ms)?$', // CSS units
            '^[\\d.]+(px|rem|em|%|vh|vw|fr|s|ms)?(\\s+[\\d.]+(px|rem|em|%|vh|vw|fr|s|ms)?)*$', // CSS values like "200px 1fr 20px"
            '^#[0-9a-fA-F]{3,8}$', // hex colors
            '^rgba?\\(.*\\)$', // rgb/rgba colors
            '^(auto|none|inherit|initial|unset|flex|grid|block|inline|inline-block|relative|absolute|fixed|sticky)$', // CSS keywords
            '^color:.*$', // CSS color declarations
            '^font-.*$', // CSS font declarations
            '^\\d+$', // numbers only
            '^https?:\\/\\/.*', // URLs
            '^@.*', // @ mentions or decorators
            '^\\/.*', // paths starting with /
            '^[HhMmSsYyDdAaPp:.,\\s-]+$', // date format patterns (HH:mm, yyyy-MM-dd, etc.)
            '^Arrow(Up|Down|Left|Right)$', // keyboard keys
            '^(Enter|Escape|Tab|Space|Backspace|Delete)$', // keyboard keys
            '^Text$', // clipboard data type
            '^(allow-|sandbox)', // iframe sandbox values
            '^Id$', // technical identifier suffix (e.g., fieldNameId)
            '^(string|number|boolean|void|any|unknown|never|object)$', // TypeScript type keywords
            '^(Dark|Light)$', // color schemes
            '^translate\\(.*\\)$', // CSS transform strings
            '^svg .*$', // CSS selectors
            '^Icon[A-Z]\\w*$', // Icon names like IconDefault, IconTable, IconSettings
            '^\\w*Icon$', // Icon names that end with Icon like FieldIcon
            '^%c.*$', // Console format strings
            // Common item IDs for selectable lists
            '^(Group|CalendarView|CalendarDateField|Compact view)$',
            '^(Layout|Visibility|Fields|Delete view|Copy link to view|Create custom view)$',
            '^(GroupBy|Sort|HideEmptyGroups|HiddenGroups)$',
            // HTTP headers and auth (technical, not user-facing)
            '^Authorization$',
            '^Bearer .*',
            // Allow object keys that are technical identifiers
            '^(topLeft|topRight|bottomLeft|bottomRight)$',
            // Color schemes and CSS media queries
            '^System$',
            '^\\(prefers-color-scheme:',
            // GraphQL query names (used in refetchQueries)
            '^Get[A-Z]\\w*$',
            // React Context names (technical identifiers)
            '.*Context$',
            // SVG paths (geometric coordinates, not translatable)
            '^M[0-9 LML]+$',
            '^[ML][0-9 ]+$',
            // Database ordering values (technical, backend API)
            '^(Asc|Desc)Nulls(First|Last)$',
            // Calendar response status values (backend enum values, not user-facing)
            '^(Yes|No|Maybe)$',
            // Email validation error prefixes (combined with dynamic content)
            '^Invalid email(s)?:',
            // GraphQL type construction patterns
            '.*FilterInput$',
            '.*OrderByInput.*',
            '^\\$filter.*',
            '^\\$orderBy.*',
            '^\\$after.*',
            '^\\$before.*',
            '^\\$first.*',
            '^\\$last.*',
            // Logger names (technical identifiers)
            '^Twenty(-\\w+)?$',
            // Cookie names and cookie string patterns
            '^twenty_session_id$',
            '^; domain=',
            // Context names for createRequiredContext
            '^[A-Z][a-zA-Z]+$',
            // JSON-like filter patterns
            '^%"type":',
            '^%"objectNameSingular":',
          ],
          ignoreNames: [
            // HTML/React attributes that shouldn't be translated
            { regex: { pattern: 'className', flags: 'i' } },
            { regex: { pattern: 'styleName', flags: 'i' } },
            { regex: { pattern: 'testId', flags: 'i' } },
            'data-testid',
            'dataTestId',
            'src',
            'srcSet',
            'href',
            'target',
            'rel',
            'type',
            'id',
            'key',
            'name',
            'htmlFor',
            'width',
            'height',
            'fill',
            'stroke',
            'viewBox',
            'clipPath',
            'd', // SVG path
            'transform',
            'displayName',
            'defaultValue',
            'to', // router links
            'path',
            'pathname',
            'hash',
            'componentInstanceId',
            'hotkeyScope',
            'dropdownId',
            'recoilScopeId',
            'modalId',
            'dialogId',
            'itemId',
            'selectableItemIdArray',
            'listenerId',
            'focusId',
            'color', // color prop values
            'variant', // component variants
            'size', // size prop values
            'position', // position values
            'align', // alignment values
            'justify', // justification values
            'direction', // direction values
            'orientation', // orientation values
            'status', // status values
            'state', // state values
            'mode', // mode values
            'accent', // accent values

            // CSS-related props
            'gridAutoColumns',
            'gridAutoRows',
            'gridTemplateColumns',
            'gridTemplateRows',
            'gridColumn',
            'gridRow',
            'gap',
            'margin',
            'padding',
            'border',
            'borderRadius',
            'boxShadow',
            'flex',
            'flexDirection',
            'flexWrap',
            'justifyContent',
            'alignItems',
            'alignContent',
            'overflow',
            'display',
            'cursor',
            'zIndex',
            'opacity',
            'fontWeight',
            'fontSize',
            'lineHeight',
            'textAlign',
            'textDecoration',
            'whiteSpace',
            'wordBreak',
            'objectFit',
            'backgroundSize',
            'backgroundPosition',
            'minWidth',
            'maxWidth',
            'minHeight',
            'maxHeight',
            'mobileGridAutoColumns',
            'tabletGridAutoColumns',

            // Styled components
            'css',
            'theme',
            'animation',
            'transition',

            // GraphQL
            'query',
            'mutation',
            'subscription',
            'fragment',
            'operationName',
            'variables',
            '__typename',

            // Technical identifiers
            'fieldName',
            'columnName',
            'objectNameSingular',
            'objectNamePlural',
            'metadataId',
            'nameSingular',
            'namePlural',

            // Event types
            'eventName',
            'event',
            'action',
            'actionType',

            // Icon names
            'iconName',
            { regex: { pattern: '^Icon[A-Z]' } },

            // UPPER_CASE names (constants)
            { regex: { pattern: '^[A-Z][A-Z0-9_]*$' } },

            // Sort direction values (backend API)
            'orderBy',
            { regex: { pattern: '^(Asc|Desc)(NullsFirst|NullsLast)?$' } },

            // HTTP headers (technical, not user-facing)
            'Authorization',
          ],
          ignoreFunctions: [
            // Console and logging
            'console.*',
            '*.log',
            '*.warn',
            '*.error',
            '*.debug',
            '*.info',
            '*.trace',
            'logDebug',
            'formatTitle',

            // Error handling (technical messages, not user-facing)
            'Error',
            'TypeError',
            'RangeError',
            'SyntaxError',
            'throw',
            'assertUnreachable',
            'CustomError',
            'parseInitialBlocknote',

            // Testing
            'describe',
            'it',
            'test',
            'expect',
            'jest.*',
            '*.toBe',
            '*.toEqual',
            '*.toContain',
            '*.toMatch',
            '*.toThrow',

            // React/Libraries internals
            'require',
            'import',
            'styled',
            'styled.*',
            'css',
            'keyframes',
            'createGlobalStyle',

            // Router
            'useNavigate',
            'navigate',
            'useLocation',
            'useParams',

            // Date formatting (patterns are not translatable)
            'format',
            'formatDate',
            'formatDateTime',
            'formatTime',
            'parseISO',
            'parse',

            // Navigation
            'useNavigationSection',

            // Recoil
            'atom',
            'atomFamily',
            'selector',
            'selectorFamily',
            'useSetRecoilState',
            'useRecoilState',
            'useRecoilValue',

            // GraphQL operations
            'gql',
            'useQuery',
            'useMutation',
            'useLazyQuery',
            'useSubscription',

            // Type checking and validation
            '*.includes',
            '*.indexOf',
            '*.startsWith',
            '*.endsWith',
            '*.split',
            '*.join',
            '*.match',
            '*.replace',
            '*.test',
            'Object.keys',
            'Object.values',
            'Object.entries',
            'Array.isArray',

            // DOM operations
            '*.getElementById',
            '*.getElementsByClassName',
            '*.querySelector',
            '*.querySelectorAll',
            '*.getAttribute',
            '*.setAttribute',
            '*.addEventListener',
            '*.removeEventListener',
            '*.dispatchEvent',
            '*.createElement',

            // Storage
            'localStorage.*',
            'sessionStorage.*',
            'searchParams.*',
            '*.get',
            '*.set',
            '*.has',
            '*.delete',

            // Misc utilities
            'cva',
            'cn',
            'clsx',
            'classNames',
            'track',
            '*.postMessage',
            '*.dispatch',
            '*.commit',

            // Event handlers (typically receive enum values, not user-facing text)
            'onChange',
            'onClick',
            'onSelect',
            'onSubmit',
            'onFocus',
            'onBlur',
            'onKeyDown',
            'onKeyUp',
            'onMouseEnter',
            'onMouseLeave',

            // Logging functions (technical messages, not user-facing)
            'logError',
            'logDebug',
            'logInfo',
            'logWarn',
            'loggerLink',

            // Context creation (technical names)
            'createRequiredContext',

            // GraphQL refetch queries (technical identifiers)
            'refetchQueries',
          ],
        },
      ],
    },
  },

  // TypeScript specific configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        // Note: project path should be specified by each package individually
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // Import restrictions
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: 'Relative parent imports are not allowed. Use @/ alias instead.',
            },
            {
              group: ['@tabler/icons-react'],
              message: 'Please import icons from `twenty-ui`',
            },
            {
              group: ['react-hotkeys-web-hook'],
              importNames: ['useHotkeys'],
              message: 'Please use the custom wrapper: `useScopedHotkeys` from `twenty-ui`',
            },
            {
              group: ['lodash'],
              message: "Please use the standalone lodash package (for instance: `import groupBy from 'lodash.groupby'` instead of `import { groupBy } from 'lodash'`)",
            },
          ],
        },
      ],

      // TypeScript rules
      'no-redeclare': 'off', // Turn off base rule for TypeScript
      '@typescript-eslint/no-redeclare': 'error', // Use TypeScript-aware version
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports'
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          allowInterfaces: 'with-single-extends',
        },
      ],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // Custom workspace rules
      '@nx/workspace-effect-components': 'error',
      '@nx/workspace-no-hardcoded-colors': 'error',
      '@nx/workspace-matching-state-variable': 'error',
      '@nx/workspace-sort-css-properties-alphabetically': 'error',
      '@nx/workspace-styled-components-prefixed-with-styled': 'error',
      '@nx/workspace-no-state-useref': 'error',
      '@nx/workspace-component-props-naming': 'error',
      '@nx/workspace-explicit-boolean-predicates-in-if': 'error',
      '@nx/workspace-use-getLoadable-and-getValue-to-get-atoms': 'error',
      '@nx/workspace-useRecoilCallback-has-dependency-array': 'error',
      '@nx/workspace-no-navigate-prefer-link': 'error',
    },
  },

  // Storybook files and story-related files
  {
    files: [
      '**/*.stories.ts',
      '**/*.stories.tsx',
      '**/*.stories.js',
      '**/*.stories.jsx',
      '**/__stories__/**/*',
    ],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'lingui/no-unlocalized-strings': 'off',
    },
  },

  // Debug files - development only, not user-facing
  {
    files: [
      '**/Debug*.tsx',
      '**/*Debug*.tsx',
      '**/*DebugDisplay*.tsx',
      '**/*DebugHelper*.tsx',
      '**/*DebugObserver*.tsx',
    ],
    rules: {
      'lingui/no-unlocalized-strings': 'off',
    },
  },

  // Testing utilities and mock data - not user-facing
  {
    files: [
      '**/testing/**/*.tsx',
      '**/testing/**/*.ts',
      '**/__mocks__/**/*',
      '**/*mock*.ts',
      '**/*Mock*.ts',
      '**/perf/**/*',
    ],
    rules: {
      'lingui/no-unlocalized-strings': 'off',
    },
  },

  // Constants files - technical values, not user-facing
  {
    files: [
      '**/constants/**/*.ts',
      '**/*.constants.ts',
      '**/validation-schemas/**/*.ts',
      '**/*Schema.ts',
      '**/*-schema.ts',
    ],
    rules: {
      'lingui/no-unlocalized-strings': 'off',
    },
  },

  // Layout configuration files - titles are translated at consumption time
  {
    files: ['**/layouts/**/*.ts'],
    rules: {
      'lingui/no-unlocalized-strings': 'off',
    },
  },

  // Service files - contain technical strings (logger names, HTTP headers, etc.)
  {
    files: ['**/services/**/*.ts'],
    rules: {
      'lingui/no-unlocalized-strings': 'off',
    },
  },

  // State files - contain technical default values
  {
    files: ['**/states/**/*.ts'],
    rules: {
      'lingui/no-unlocalized-strings': 'off',
    },
  },

  // Utility files - technical/developer-facing
  {
    files: [
      '**/utils/**/*.ts',
      '**/*Utils.ts',
      '**/*-utils.ts',
      '**/*Util.ts',
      '**/*-util.ts',
      '**/errors/**/*.ts',
      '**/*Error.ts',
      '**/*-error.ts',
    ],
    rules: {
      'lingui/no-unlocalized-strings': 'off',
    },
  },

  // Config and setup files - not user-facing
  {
    files: [
      '**/*.config.ts',
      '**/*.config.js',
      '**/vite.config.ts',
      '**/.storybook/**/*',
    ],
    rules: {
      'lingui/no-unlocalized-strings': 'off',
    },
  },


  // JavaScript specific configuration
  {
    files: ['*.{js,jsx}'],
    rules: {
      // JavaScript-specific rules if needed
    },
  },

  // Constants files
  {
    files: ['**/constants/*.ts', '**/*.constants.ts'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['UPPER_CASE'],
        },
      ],
      'unicorn/filename-case': [
        'warn',
        {
          cases: {
            pascalCase: true,
          },
        },
      ],
      '@nx/workspace-max-consts-per-file': ['error', { max: 1 }],
    },
  },

  // Test files
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.test.js',
      '**/*.test.jsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.spec.js',
      '**/*.spec.jsx',
      '**/__tests__/**/*.ts',
      '**/__tests__/**/*.tsx',
      '**/__mocks__/**/*.ts',
      '**/__mocks__/**/*.tsx',
    ],
    languageOptions: {
      globals: {
        jest: true,
        describe: true,
        it: true,
        expect: true,
        beforeEach: true,
        afterEach: true,
        beforeAll: true,
        afterAll: true,
      },
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'lingui/no-unlocalized-strings': 'off',
    },
  },

  // Constants files
  {
    files: ['**/*.constants.ts'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['UPPER_CASE'],
        },
      ],
      'unicorn/filename-case': [
        'warn',
        {
          cases: {
            pascalCase: true,
          },
        },
      ],
      '@nx/workspace-max-consts-per-file': ['error', { max: 1 }],
    },
  },

  // JSON files
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: jsoncParser,
    },
  },
];
