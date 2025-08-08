const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});
module.exports = [{
    extends: compat.extends("../../eslint.config.global.js", "../../eslint.config.react.js"),
}, {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
        parserOptions: {
            project: ["packages/twenty-emails/tsconfig.*.json"],
        },
    },
    rules: {
        "@nx/dependency-checks": "error",
    },
}];
