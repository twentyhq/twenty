const js = require("@eslint/js");
const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = [{
    extends: compat.extends("../../eslint.config.react.js"),
}, {
    ignores: [
    "**/node_modules",
    "**/mockServiceWorker.js",
    "**/generated*/*",
    "**/build",
    "**/coverage",
    "**/storybook-static",
    "**/*config.js",
    "**/jest.config.ts",
    "**/lingui.config.ts",
    "**/vite.config.ts",
    "**/setupTests.ts",
    "**/__mocks__/**/*",
    "src/testing/mock-data/**/*",
    ],
}, {
    files: ["**/*.ts", "**/*.tsx"],

    languageOptions: {
        parserOptions: {
            project: ["packages/twenty-front/tsconfig.dev.json"],
        },
    },
}];
