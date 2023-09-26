"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rule_tester_1 = require("@typescript-eslint/rule-tester");
const no_spread_props_1 = __importDefault(require("../rules/no-spread-props"));
const ruleTester = new rule_tester_1.RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: "./tsconfig.json",
      tsconfigRootDir: __dirname,
      ecmaFeatures: {
        jsx: true,
      },
    },
  });
ruleTester.run("no-spread-props", no_spread_props_1.default, {
    valid: [
        {
          code: "<MyComponent prop1={value} prop2={value} />",
        },
      ],
      invalid: [
        {
          code: "<MyComponent {...props} />",
          errors: [
            {
              messageId: "noSpreadProps",
            },
          ],
        },
      ],
});
