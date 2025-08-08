const nx = require("@nx/eslint-plugin");
const preferArrow = require("eslint-plugin-prefer-arrow");
const _import = require("eslint-plugin-import");
const unusedImports = require("eslint-plugin-unused-imports");
const unicorn = require("eslint-plugin-unicorn");
const lingui = require("eslint-plugin-lingui");

const {
    fixupPluginRules,
} = require("@eslint/compat");

const globals = require("globals");
const parser = require("jsonc-eslint-parser");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = [
...compat.extends("plugin:prettier/recommended", "plugin:lingui/recommended"),
{
    plugins: {
        "@nx": nx,
        "prefer-arrow": preferArrow,
        import: fixupPluginRules(_import),
        "unused-imports": unusedImports,
        unicorn,
        lingui,
    },

    rules: {
        "lingui/no-single-variables-to-translate": "off",

        "func-style": ["error", "declaration", {
            allowArrowFunctions: true,
        }],

        "no-console": ["warn", {
            allow: ["group", "groupCollapsed", "groupEnd"],
        }],

        "no-control-regex": 0,
        "no-debugger": "error",
        "no-duplicate-imports": "error",
        "no-undef": "off",
        "no-unused-vars": "off",

        "@nx/enforce-module-boundaries": ["error", {
            enforceBuildableLibDependency: true,
            allow: [],

            depConstraints: [{
                sourceTag: "scope:shared",
                onlyDependOnLibsWithTags: ["scope:shared"],
            }, {
                sourceTag: "scope:backend",
                onlyDependOnLibsWithTags: ["scope:shared", "scope:backend"],
            }, {
                sourceTag: "scope:frontend",
                onlyDependOnLibsWithTags: ["scope:shared", "scope:frontend"],
            }, {
                sourceTag: "scope:zapier",
                onlyDependOnLibsWithTags: ["scope:shared"],
            }],
        }],

        "import/no-relative-packages": "error",
        "import/no-useless-path-segments": "error",

        "import/no-duplicates": ["error", {
            considerQueryString: true,
        }],

        "prefer-arrow/prefer-arrow-functions": ["error", {
            disallowPrototype: true,
            singleReturnOnly: false,
            classPropertiesAllowed: false,
        }],

        "unused-imports/no-unused-imports": "warn",

        "unused-imports/no-unused-vars": ["warn", {
            vars: "all",
            varsIgnorePattern: "^_",
            args: "after-used",
            argsIgnorePattern: "^_",
        }],
    },
}, {
    ignores: ["**/node_modules"],
}, 
...compat.extends("plugin:@nx/typescript").map(config => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"]
})),
{
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
        "@typescript-eslint/ban-ts-comment": "error",

        "@typescript-eslint/consistent-type-imports": ["error", {
            prefer: "type-imports",
            fixStyle: "inline-type-imports",
        }],

        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/interface-name-prefix": "off",

        "@typescript-eslint/no-empty-interface": ["error", {
            allowSingleExtends: true,
        }],

        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-unused-vars": "off",
    },
}, 
...compat.extends("plugin:@nx/javascript").map(config => ({
    ...config,
    files: ["**/*.js", "**/*.jsx"]
})),
{
    files: [
        "**/*.spec.@(ts|tsx|js|jsx)",
        "**/*.integration-spec.@(ts|tsx|js|jsx)",
        "**/*.test.@(ts|tsx|js|jsx)",
    ],

    languageOptions: {
        globals: {
            ...globals.jest,
        },
    },

    rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
    },
}, {
    files: ["**/constants/*.ts", "**/*.constants.ts"],

    rules: {
        "@typescript-eslint/naming-convention": ["error", {
            selector: "variable",
            format: ["UPPER_CASE"],
        }],

        "unicorn/filename-case": ["warn", {
            cases: {
                pascalCase: true,
            },
        }],

        "@nx/workspace-max-consts-per-file": ["error", {
            max: 1,
        }],
    },
}, {
    files: ["**/*.json"],

    languageOptions: {
        parser: parser,
    },
}];
